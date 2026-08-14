package com.sunshine.orders.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.util.List;
import java.time.Instant;

public final class OrderModels {
    private OrderModels() {
    }

    public record OrderItem(
            @NotBlank String productId,
            @NotBlank String slug,
            @NotBlank String name,
            @Positive int price,
            @Positive int quantity,
            String selectedSize,
            @PositiveOrZero int availableStock
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

    public enum DeliveryStatus { PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, NOT_CREATED }

    public enum InventoryDisposition { COMMITTED, RELEASED, REJECTED }

    public enum MilestoneState { COMPLETED, CURRENT, UPCOMING, STOPPED }

    public enum MilestoneCode {
        ORDER_RECEIVED,
        INVENTORY_RESERVED,
        PAYMENT_APPROVED,
        PICKING,
        PACKED,
        SHIPPED,
        OUT_FOR_DELIVERY,
        DELIVERED
    }

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

    public record InventoryLine(
            String productId,
            String name,
            int requested,
            int availableBefore,
            int reserved,
            int availableAfter
    ) {
    }

    public record OrderMilestone(
            MilestoneCode code,
            String label,
            MilestoneState state,
            String message,
            Instant occurredAt
    ) {
    }

    public record OrderResponse(
            String orderId,
            OrderStatus status,
            int total,
            int deliveryFee,
            String estimatedDelivery,
            String paymentReference,
            PaymentMethod paymentMethod,
            DeliveryStatus deliveryStatus,
            String destinationCity,
            Instant createdAt,
            List<OrderItem> items,
            String message,
            InventoryDisposition inventoryDisposition,
            List<InventoryLine> inventory,
            List<OrderMilestone> milestones,
            List<AgentStep> trace
    ) {
    }
}
