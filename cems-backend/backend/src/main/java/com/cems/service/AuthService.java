package com.cems.service;

import com.cems.dto.request.LoginRequest;
import com.cems.dto.request.RegisterRequest;
import com.cems.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
