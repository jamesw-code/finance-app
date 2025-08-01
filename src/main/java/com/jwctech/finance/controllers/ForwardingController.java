package com.jwctech.finance.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Slf4j
@Controller
public class ForwardingController {
    @GetMapping(value = {"/{path:(?!api)[^.]+}/**"})
    public String redirect(@PathVariable("path") String path) {
        if(path.contains(".")) {
            return "";
        }
        log.info("redirecting route: {} to angular for processing", path);
        return "forward:/";
    }
}
