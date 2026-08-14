package com.sunshine.orders.agent;

import com.sunshine.orders.model.OrderModels.AgentStep;
import com.sunshine.orders.model.OrderModels.Customer;
import com.sunshine.orders.model.OrderModels.MilestoneCode;
import com.sunshine.orders.model.OrderModels.MilestoneState;
import com.sunshine.orders.model.OrderModels.OrderMilestone;
import com.sunshine.orders.model.OrderModels.OrderStatus;
import com.sunshine.orders.model.OrderModels.StepStatus;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Component
public class DeliveryAgent {
    private static final List<Template> TEMPLATES = List.of(
            new Template(MilestoneCode.ORDER_RECEIVED, "Order received", "The order details were validated and recorded.", 0),
            new Template(MilestoneCode.INVENTORY_RESERVED, "Items reserved", "Available units were held while payment was reviewed.", 1),
            new Template(MilestoneCode.PAYMENT_APPROVED, "Payment confirmed", "The selected payment method was approved.", 2),
            new Template(MilestoneCode.PICKING, "Picking items", "The fulfilment team is collecting the order items.", 45),
            new Template(MilestoneCode.PACKED, "Packed", "The order was checked, packed and labelled.", 180),
            new Template(MilestoneCode.SHIPPED, "Shipped", "The parcel left the fulfilment centre.", 360),
            new Template(MilestoneCode.OUT_FOR_DELIVERY, "Out for delivery", "The parcel is with the local delivery partner.", 4320),
            new Template(MilestoneCode.DELIVERED, "Delivered", "The parcel reached the delivery address.", 4740)
    );

    public DeliveryResult schedule(Customer customer, Instant createdAt) {
        List<OrderMilestone> milestones = new ArrayList<>();
        for (int index = 0; index < TEMPLATES.size(); index++) {
            Template template = TEMPLATES.get(index);
            MilestoneState state = index < 3 ? MilestoneState.COMPLETED
                    : index == 3 ? MilestoneState.CURRENT
                    : MilestoneState.UPCOMING;
            Instant occurredAt = index <= 3
                    ? createdAt.plus(template.offsetMinutes(), ChronoUnit.MINUTES)
                    : null;
            milestones.add(toMilestone(template, state, template.message(), occurredAt));
        }
        AgentStep step = new AgentStep(
                "Delivery Agent",
                StepStatus.completed,
                "Delivery milestones scheduled for " + customer.city() + " " + customer.pincode() + ".",
                131
        );
        return new DeliveryResult(step, milestones);
    }

    public List<OrderMilestone> stopped(Instant createdAt, OrderStatus status) {
        int stoppedIndex = status == OrderStatus.OUT_OF_STOCK ? 1 : 2;
        String failureMessage = status == OrderStatus.OUT_OF_STOCK
                ? "The requested quantity was no longer available. Payment was not attempted."
                : "Payment was declined. The temporary stock hold was released automatically.";
        List<OrderMilestone> milestones = new ArrayList<>();
        for (int index = 0; index < TEMPLATES.size(); index++) {
            Template template = TEMPLATES.get(index);
            if (index < stoppedIndex) {
                milestones.add(toMilestone(
                        template,
                        MilestoneState.COMPLETED,
                        template.message(),
                        createdAt.plus(template.offsetMinutes(), ChronoUnit.MINUTES)
                ));
            } else {
                milestones.add(toMilestone(
                        template,
                        MilestoneState.STOPPED,
                        index == stoppedIndex ? failureMessage : "This stage was not started.",
                        index == stoppedIndex
                                ? createdAt.plus(template.offsetMinutes(), ChronoUnit.MINUTES)
                                : null
                ));
            }
        }
        return milestones;
    }

    private OrderMilestone toMilestone(
            Template template,
            MilestoneState state,
            String message,
            Instant occurredAt
    ) {
        return new OrderMilestone(template.code(), template.label(), state, message, occurredAt);
    }

    private record Template(
            MilestoneCode code,
            String label,
            String message,
            long offsetMinutes
    ) {
    }

    public record DeliveryResult(AgentStep step, List<OrderMilestone> milestones) {
    }
}
