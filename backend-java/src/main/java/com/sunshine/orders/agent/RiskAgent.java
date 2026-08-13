package com.sunshine.orders.agent;

import com.sunshine.orders.model.OrderModels.AgentStep;
import com.sunshine.orders.model.OrderModels.OrderRequest;
import com.sunshine.orders.model.OrderModels.StepStatus;
import org.springframework.stereotype.Component;

@Component
public class RiskAgent {
    public AgentStep review(OrderRequest order) {
        return new AgentStep(
                "Risk Agent",
                StepStatus.completed,
                "Address, order value and payment rules passed the demo risk check.",
                93
        );
    }
}
