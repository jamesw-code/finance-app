package com.jwctech.finance.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ForwardingController {
  @GetMapping(value = {
    "/{path:^(?!api|index\\.html|.*\\..*).*$}/**"
  })
  public String redirect() {
    return "forward:/";
  }
}
