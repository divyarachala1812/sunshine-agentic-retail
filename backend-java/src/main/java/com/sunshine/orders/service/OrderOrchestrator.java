package com.sunshine.orders.service;

import com.sunshine.orders.agent.CatalogueAgent;
import com.sunshine.orders.agent.DeliveryAgent;
import com.sunshine.orders.agent.FulfilmentAgent;
import com.sunshine.orders.agent.NotificationAgent;
import com.sunshine.orders.agent.PaymentAgent;
import com.sunshine.orders.agent.RiskAgent;
import com.sunshine.orders.model.OrderModels.AgentStep;
import com.sunshine.orders.model.OrderModels.DeliveryStatus;
import com.sunshine.orders.model.OrderModels.InventoryDisposition;
import com.sunshine.orders.model.OrderModels.InventoryLine;
import com.sunshine.orders.model.OrderModels.OrderItem;
import com.sunshine.orders.model.OrderModels.OrderRequest;
import com.sunshine.orders.model.OrderModels.OrderResponse;
import com.sunshine.orders.model.OrderModels.OrderStatus;
import com.sunshine.orders.model.OrderModels.StepStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class OrderOrchestrator {
    private final CatalogueAgent catalogueAgent;
    private final PaymentAgent paymentAgent;
    private final FulfilmentAgent fulfilmentAgent;
    private final RiskAgent riskAgent;
    private final DeliveryAgent deliveryAgent;
    private final NotificationAgent notificationAgent;

    public OrderOrchestrator(
            CatalogueAgent catalogueAgent,
            PaymentAgent paymentAgent,
            FulfilmentAgent fulfilmentAgent,
            RiskAgent riskAgent,
            DeliveryAgent deliveryAgent,
            NotificationAgent notificationAgent
    ) {
        this.catalogueAgent = catalogueAgent;
        this.paymentAgent = paymentAgent;
        this.fulfilmentAgent = fulfilmentAgent;
        this.riskAgent = riskAgent;
        this.deliveryAgent = deliveryAgent;
        this.notificationAgent = notificationAgent;
    }

    public OrderResponse process(OrderRequest request) {
        int subtotal = request.items().stream()
                .mapToInt(item -> item.price() * item.quantity())
                .sum();
        int deliveryFee = subtotal >= 999 ? 0 : 79;
        int total = subtotal + deliveryFee;
        String orderId = reference("SUN");
        Instant createdAt = Instant.now();
        List<AgentStep> trace = new ArrayList<>();

        AgentStep catalogueStep = catalogueAgent.reserve(request);
        trace.add(catalogueStep);
        if (catalogueStep.status() == StepStatus.failed) {
            trace.add(skipped("Risk Agent", "Order risk rules were not required."));
            trace.add(skipped("Payment Agent", "Payment was not attempted."));
            trace.add(skipped("Fulfilment Agent", "Delivery planning was not required."));
            trace.add(skipped("Delivery Agent", "No delivery journey was created."));
            trace.add(notificationAgent.record(OrderStatus.OUT_OF_STOCK));
            return response(
                    orderId,
                    OrderStatus.OUT_OF_STOCK,
                    total,
                    deliveryFee,
                    null,
                    null,
                    DeliveryStatus.NOT_CREATED,
                    request,
                    createdAt,
                    "The order was stopped before payment because an item is out of stock.",
                    InventoryDisposition.REJECTED,
                    deliveryAgent.stopped(createdAt, OrderStatus.OUT_OF_STOCK),
                    trace
            );
        }

        trace.add(riskAgent.review(request));
        PaymentAgent.PaymentResult payment = paymentAgent.authorize(
                request,
                reference(request.paymentMethod().name())
        );
        trace.add(payment.step());
        if (payment.step().status() == StepStatus.failed) {
            trace.add(skipped("Fulfilment Agent", "Reserved stock was released; delivery was not booked."));
            trace.add(skipped("Delivery Agent", "No delivery journey was created."));
            trace.add(notificationAgent.record(OrderStatus.PAYMENT_FAILED));
            return response(
                    orderId,
                    OrderStatus.PAYMENT_FAILED,
                    total,
                    deliveryFee,
                    null,
                    null,
                    DeliveryStatus.NOT_CREATED,
                    request,
                    createdAt,
                    "Payment could not be authorised. No money was charged.",
                    InventoryDisposition.RELEASED,
                    deliveryAgent.stopped(createdAt, OrderStatus.PAYMENT_FAILED),
                    trace
            );
        }

        FulfilmentAgent.FulfilmentResult fulfilment = fulfilmentAgent.plan(request.customer());
        trace.add(fulfilment.step());
        DeliveryAgent.DeliveryResult delivery = deliveryAgent.schedule(request.customer(), createdAt);
        trace.add(delivery.step());
        trace.add(notificationAgent.record(OrderStatus.CONFIRMED));
        return response(
                orderId,
                OrderStatus.CONFIRMED,
                total,
                deliveryFee,
                fulfilment.estimatedDelivery(),
                payment.paymentReference(),
                DeliveryStatus.PROCESSING,
                request,
                createdAt,
                "Your order is confirmed and is being prepared for dispatch.",
                InventoryDisposition.COMMITTED,
                delivery.milestones(),
                trace
        );
    }

    private OrderResponse response(
            String orderId,
            OrderStatus status,
            int total,
            int deliveryFee,
            String estimatedDelivery,
            String paymentReference,
            DeliveryStatus deliveryStatus,
            OrderRequest request,
            Instant createdAt,
            String message,
            InventoryDisposition disposition,
            List<com.sunshine.orders.model.OrderModels.OrderMilestone> milestones,
            List<AgentStep> trace
    ) {
        return new OrderResponse(
                orderId,
                status,
                total,
                deliveryFee,
                estimatedDelivery,
                paymentReference,
                request.paymentMethod(),
                deliveryStatus,
                request.customer().city(),
                createdAt,
                request.items(),
                message,
                disposition,
                inventory(request.items(), disposition),
                milestones,
                trace
        );
    }

    private List<InventoryLine> inventory(List<OrderItem> items, InventoryDisposition disposition) {
        return items.stream().map(item -> new InventoryLine(
                item.productId(),
                item.name(),
                item.quantity(),
                item.availableStock(),
                disposition == InventoryDisposition.REJECTED ? 0 : item.quantity(),
                disposition == InventoryDisposition.COMMITTED
                        ? Math.max(0, item.availableStock() - item.quantity())
                        : item.availableStock()
        )).toList();
    }

    private AgentStep skipped(String agent, String message) {
        return new AgentStep(agent, StepStatus.skipped, message, 0);
    }

    private String reference(String prefix) {
        long timestamp = System.currentTimeMillis() % 100_000_000L;
        int random = ThreadLocalRandom.current().nextInt(100, 1000);
        return "%s-%08d%d".formatted(prefix, timestamp, random);
    }
}
