package com.sunshine.orders.agent;

import com.sunshine.orders.model.OrderModels.AgentStep;
import com.sunshine.orders.model.OrderModels.OrderRequest;
import com.sunshine.orders.model.OrderModels.OrderScenario;
import com.sunshine.orders.model.OrderModels.StepStatus;
import org.springframework.stereotype.Component;

@Component
public class CatalogueAgent {
    public AgentStep reserve(OrderRequest order) {
        if (order.scenario() == OrderScenario.OUT_OF_STOCK) {
            return new AgentStep(
                    "Catalogue Agent",
                    StepStatus.failed,
                    "One cart item became unavailable before reservation.",
                    118
            );
        }

        String suffix = order.items().size() == 1 ? "" : "s";
        return new AgentStep(
                "Catalogue Agent",
                StepStatus.completed,
                order.items().size() + " item type" + suffix + " checked and reserved.",
                126
        );
    }
}
