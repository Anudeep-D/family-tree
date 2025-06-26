package dev.anudeep.familytree.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.anudeep.familytree.model.Filter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class FilterNodeConverter {

    private static final Logger logger = LoggerFactory.getLogger(FilterNodeConverter.class);
    private final ObjectMapper objectMapper;

    public FilterNodeConverter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> flatten(Filter filter) {
        Map<String, Object> properties = new HashMap<>();
        if (filter == null) {
            return properties;
        }

        properties.put("filterName", filter.getFilterName());
        properties.put("enabled", filter.isEnabled());

        if (filter.getFilterBy() != null) {
            try {
                String filterByJson = objectMapper.writeValueAsString(filter.getFilterBy());
                properties.put("filterBy", filterByJson);
            } catch (JsonProcessingException e) {
                logger.error("Error serializing FilterBy to JSON", e);
                // Handle error appropriately, perhaps throw a custom exception
            }
        }
        return properties;
    }

    public Filter unflatten(Map<String, Object> properties) {
        if (properties == null || properties.isEmpty()) {
            return null;
        }

        Filter filter = new Filter();
        filter.setFilterName((String) properties.get("filterName"));
        if (properties.containsKey("enabled")) {
            Object enabledObj = properties.get("enabled");
            if (enabledObj instanceof Boolean) {
                filter.setEnabled((Boolean) enabledObj);
            } else if (enabledObj instanceof String) {
                filter.setEnabled(Boolean.parseBoolean((String) enabledObj));
            }
        }


        String filterByJson = (String) properties.get("filterBy");
        if (filterByJson != null && !filterByJson.isEmpty()) {
            try {
                Filter.FilterBy filterBy = objectMapper.readValue(filterByJson, Filter.FilterBy.class);
                filter.setFilterBy(filterBy);
            } catch (IOException e) {
                logger.error("Error deserializing FilterBy from JSON", e);
                // Handle error appropriately
            }
        }
        return filter;
    }
}
