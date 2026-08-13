package com.sunshine.orders.agent;

import com.sunshine.orders.model.OrderModels.AgentStep;
import com.sunshine.orders.model.OrderModels.OrderRequest;
import com.sunshine.orders.model.OrderModels.OrderScenario;
import com.sunshine.orders.model.OrderModels.StepStatus;
import org.springframework.stereotype.Component;

@Component
public class PaymentAgent {
    public PaymentResult authorize(OrderRequest order, String reference) {
        if (order.scenario() == OrderScenario.PAYMENT_FAILED) {
            return new PaymentResult(
                    new AgentStep(
                            "Payment Agent",
                            StepStatus.failed,
                            order.paymentMethod() + " authorisation was declined in the demo scenario.",
                            284
                    ),
                    null
            );
        }

        String message = order.paymentMethod().name().equals("COD")
                ? "Cash on delivery eligibility confirmed."
                : order.paymentMethod() + " payment authorised securely.";
        return new PaymentResult(
                new AgentStep("Payment Agent", StepStatus.completed, message, 242),
                reference
        );
    }

    public record PaymentResult(AgentStep step, String paymentReference) {
    }
}
