package com.sunshine.orders.service;

import com.sunshine.orders.agent.CatalogueAgent;
import com.sunshine.orders.agent.FulfilmentAgent;
import com.sunshine.orders.agent.PaymentAgent;
import com.sunshine.orders.agent.RiskAgent;
import com.sunshine.orders.agent.NotificationAgent;
import com.sunshine.orders.model.OrderModels.AgentStep;
import com.sunshine.orders.model.OrderModels.OrderRequest;
import com.sunshine.orders.model.OrderModels.OrderResponse;
import com.sunshine.orders.model.OrderModels.OrderStatus;
import com.sunshine.orders.model.OrderModels.StepStatus;
import com.sunshine.orders.model.OrderModels.DeliveryStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.time.Instant;

@Service
public class OrderOrchestrator {
    private final CatalogueAgent catalogueAgent;
    private final PaymentAgent paymentAgent;
    private final FulfilmentAgent fulfilmentAgent;
    private final RiskAgent riskAgent;
    private final NotificationAgent notificationAgent;

    public OrderOrchestrator(
            CatalogueAgent catalogueAgent,
            PaymentAgent paymentAgent,
            FulfilmentAgent fulfilmentAgent,
            RiskAgent riskAgent,
            NotificationAgent notificationAgent
    ) {
        this.catalogueAgent = catalogueAgent;
        this.paymentAgent = paymentAgent;
        this.fulfilmentAgent = fulfilmentAgent;
        this.riskAgent = riskAgent;
        this.notificationAgent = notificationAgent;
    }

    public OrderResponse process(OrderRequest request) {
        int subtotal = request.items().stream()
                .mapToInt(item -> item.price() * item.quantity())
                .sum();
        int deliveryFee = subtotal >= 999 ? 0 : 79;
        int total = subtotal + deliveryFee;
        String orderId = reference("SUN");
        List<AgentStep> trace = new ArrayList<>();

        AgentStep catalogueStep = catalogueAgent.reserve(request);
        trace.add(catalogueStep);
        if (catalogueStep.status() == StepStatus.failed) {
            trace.add(skipped("Payment Agent", "Payment was not attempted."));
            trace.add(skipped("Fulfilment Agent", "Delivery planning was not required."));
            trace.add(1, skipped("Risk Agent", "Order risk rules were not required."));
            trace.add(notificationAgent.record(OrderStatus.OUT_OF_STOCK));
            return new OrderResponse(
                    orderId,
                    OrderStatus.OUT_OF_STOCK,
                    total,
                    deliveryFee,
                    null,
                    null,
                    request.paymentMethod(),
                    DeliveryStatus.NOT_CREATED,
                    request.customer().city(),
                    Instant.now(),
                    request.items(),
                    "The order was stopped before payment because an item is out of stock.",
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
            trace.add(notificationAgent.record(OrderStatus.PAYMENT_FAILED));
            return new OrderResponse(
                    orderId,
                    OrderStatus.PAYMENT_FAILED,
                    total,
                    deliveryFee,
                    null,
                    null,
                    request.paymentMethod(),
                    DeliveryStatus.NOT_CREATED,
                    request.customer().city(),
                    Instant.now(),
                    request.items(),
                    "Payment could not be authorised. No money was charged.",
                    trace
            );
        }

        FulfilmentAgent.FulfilmentResult fulfilment = fulfilmentAgent.plan(request.customer());
        trace.add(fulfilment.step());
        trace.add(notificationAgent.record(OrderStatus.CONFIRMED));
        return new OrderResponse(
                orderId,
                OrderStatus.CONFIRMED,
                total,
                deliveryFee,
                fulfilment.estimatedDelivery(),
                payment.paymentReference(),
                request.paymentMethod(),
                DeliveryStatus.PROCESSING,
                request.customer().city(),
                Instant.now(),
                request.items(),
                "Your order is confirmed and is being prepared for dispatch.",
                trace
        );
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
