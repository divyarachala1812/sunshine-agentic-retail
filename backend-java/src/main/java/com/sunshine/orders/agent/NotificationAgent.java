package com.sunshine.orders.agent;

import com.sunshine.orders.model.OrderModels.AgentStep;
import com.sunshine.orders.model.OrderModels.OrderStatus;
import com.sunshine.orders.model.OrderModels.StepStatus;
import org.springframework.stereotype.Component;

@Component
public class NotificationAgent {
    public AgentStep record(OrderStatus status) {
        String message = switch (status) {
            case CONFIRMED -> "Confirmation and tracking details were added to recent orders.";
            case PAYMENT_FAILED -> "A payment-failure update was added to recent orders.";
            case OUT_OF_STOCK -> "A stock alert was added to the customer order history.";
        };
        return new AgentStep("Notification Agent", StepStatus.completed, message, 76);
    }
}
