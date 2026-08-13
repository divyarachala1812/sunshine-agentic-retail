package com.sunshine.orders.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.util.List;

public final class OrderModels {
    private OrderModels() {
    }

    public record OrderItem(
            @NotBlank String productId,
            @NotBlank String name,
            @Positive int price,
            @Positive int quantity
    ) {
    }

    public record Customer(
            @NotBlank String name,
            @Pattern(regexp = "[6-9][0-9]{9}") String phone,
            @NotBlank String address,
            @NotBlank String city,
            @Pattern(regexp = "[1-9][0-9]{5}") String pincode
    ) {
    }

    public enum PaymentMethod { UPI, CARD, COD }

    public enum OrderScenario { SUCCESS, PAYMENT_FAILED, OUT_OF_STOCK }

    public enum OrderStatus { CONFIRMED, PAYMENT_FAILED, OUT_OF_STOCK }

    public enum StepStatus { completed, failed, skipped }

    public record OrderRequest(
            @NotEmpty List<@Valid OrderItem> items,
            @Valid Customer customer,
            PaymentMethod paymentMethod,
            OrderScenario scenario
    ) {
    }

    public record AgentStep(
            String agent,
            StepStatus status,
            String message,
            int durationMs
    ) {
    }

    public record OrderResponse(
            String orderId,
            OrderStatus status,
            int total,
            int deliveryFee,
            String estimatedDelivery,
            String paymentReference,
            String message,
            List<AgentStep> trace
    ) {
    }
}
