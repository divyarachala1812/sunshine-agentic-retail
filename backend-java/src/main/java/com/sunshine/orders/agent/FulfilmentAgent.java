package com.sunshine.orders.agent;

import com.sunshine.orders.model.OrderModels.AgentStep;
import com.sunshine.orders.model.OrderModels.Customer;
import com.sunshine.orders.model.OrderModels.StepStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Component
public class FulfilmentAgent {
    public FulfilmentResult plan(Customer customer) {
        String date = LocalDate.now()
                .plusDays(4)
                .format(DateTimeFormatter.ofPattern("EEE, d MMM", Locale.forLanguageTag("en-IN")));
        AgentStep step = new AgentStep(
                "Fulfilment Agent",
                StepStatus.completed,
                "Shipment planned for " + customer.city() + " " + customer.pincode() + ".",
                164
        );
        return new FulfilmentResult(step, date);
    }

    public record FulfilmentResult(AgentStep step, String estimatedDelivery) {
    }
}
