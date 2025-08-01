package com.jwctech.finance.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HeathController {

  @GetMapping("/api/health-check")
  public String health() {
    return "ok";
  }
}
