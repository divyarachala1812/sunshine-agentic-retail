package com.sunshine.orders.service;

import com.sunshine.orders.agent.CatalogueAgent;
import com.sunshine.orders.agent.FulfilmentAgent;
import com.sunshine.orders.agent.PaymentAgent;
import com.sunshine.orders.agent.RiskAgent;
import com.sunshine.orders.agent.NotificationAgent;
import com.sunshine.orders.model.OrderModels.Customer;
import com.sunshine.orders.model.OrderModels.OrderItem;
import com.sunshine.orders.model.OrderModels.OrderRequest;
import com.sunshine.orders.model.OrderModels.OrderScenario;
import com.sunshine.orders.model.OrderModels.OrderStatus;
import com.sunshine.orders.model.OrderModels.PaymentMethod;
import com.sunshine.orders.model.OrderModels.StepStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class OrderOrchestratorTest {
    private OrderOrchestrator orchestrator;

    @BeforeEach
    void setUp() {
        orchestrator = new OrderOrchestrator(
                new CatalogueAgent(),
                new PaymentAgent(),
                new FulfilmentAgent(),
                new RiskAgent(),
                new NotificationAgent()
        );
    }

    @Test
    void confirmsSuccessfulOrderAndRunsAllAgents() {
        var result = orchestrator.process(request(OrderScenario.SUCCESS));

        assertThat(result.status()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(result.trace()).hasSize(5).allMatch(step -> step.status() == StepStatus.completed);
        assertThat(result.total()).isEqualTo(1499);
        assertThat(result.deliveryFee()).isZero();
        assertThat(result.paymentReference()).startsWith("UPI-");
    }

    @Test
    void stopsAfterPaymentFailureAndSkipsFulfilment() {
        var result = orchestrator.process(request(OrderScenario.PAYMENT_FAILED));

        assertThat(result.status()).isEqualTo(OrderStatus.PAYMENT_FAILED);
        assertThat(result.trace().get(2).status()).isEqualTo(StepStatus.failed);
        assertThat(result.trace().get(3).status()).isEqualTo(StepStatus.skipped);
        assertThat(result.paymentReference()).isNull();
    }

    @Test
    void stopsBeforePaymentWhenCatalogueFails() {
        var result = orchestrator.process(request(OrderScenario.OUT_OF_STOCK));

        assertThat(result.status()).isEqualTo(OrderStatus.OUT_OF_STOCK);
        assertThat(result.trace().get(0).status()).isEqualTo(StepStatus.failed);
        assertThat(result.trace().get(1).status()).isEqualTo(StepStatus.skipped);
        assertThat(result.trace().get(2).status()).isEqualTo(StepStatus.skipped);
        assertThat(result.trace().get(3).status()).isEqualTo(StepStatus.skipped);
        assertThat(result.trace().get(4).status()).isEqualTo(StepStatus.completed);
    }

    @Test
    void stopsWhenRequestedQuantityExceedsAvailableStock() {
        var request = new OrderRequest(
                List.of(new OrderItem("EL-002", "veda-book-air-14-laptop", "Book Air 14 Laptop", 54990, 1, null, 0)),
                new Customer("Divya Rachala", "9876543210", "Madhapur", "Hyderabad", "500081"),
                PaymentMethod.UPI,
                OrderScenario.SUCCESS
        );

        var result = orchestrator.process(request);

        assertThat(result.status()).isEqualTo(OrderStatus.OUT_OF_STOCK);
        assertThat(result.trace().get(0).message()).contains("Book Air 14 Laptop");
        assertThat(result.trace().get(4).status()).isEqualTo(StepStatus.completed);
    }

    private OrderRequest request(OrderScenario scenario) {
        return new OrderRequest(
                List.of(new OrderItem("WO-001", "anvi-aarohi-floral-kurta-set", "Aarohi Floral Kurta Set", 1499, 1, "S", 1)),
                new Customer("Divya Rachala", "9876543210", "Madhapur", "Hyderabad", "500081"),
                PaymentMethod.UPI,
                scenario
        );
    }
}
