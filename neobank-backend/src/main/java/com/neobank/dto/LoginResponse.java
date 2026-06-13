package com.neobank.dto;

public class LoginResponse {
    private String token;
    private String id;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String address;
    private String createdAt;
    private String status;
    private String avatarInitials;

    public LoginResponse() {}

    public LoginResponse(String token, String id, String name, String email, String role, String phone,
                         String address, String createdAt, String status, String avatarInitials) {
        this.token = token; this.id = id; this.name = name; this.email = email; this.role = role;
        this.phone = phone; this.address = address; this.createdAt = createdAt;
        this.status = status; this.avatarInitials = avatarInitials;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAvatarInitials() { return avatarInitials; }
    public void setAvatarInitials(String avatarInitials) { this.avatarInitials = avatarInitials; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private String token; private String id; private String name; private String email; private String role;
        private String phone; private String address; private String createdAt; private String status; private String avatarInitials;

        public Builder token(String v) { this.token = v; return this; }
        public Builder id(String v) { this.id = v; return this; }
        public Builder name(String v) { this.name = v; return this; }
        public Builder email(String v) { this.email = v; return this; }
        public Builder role(String v) { this.role = v; return this; }
        public Builder phone(String v) { this.phone = v; return this; }
        public Builder address(String v) { this.address = v; return this; }
        public Builder createdAt(String v) { this.createdAt = v; return this; }
        public Builder status(String v) { this.status = v; return this; }
        public Builder avatarInitials(String v) { this.avatarInitials = v; return this; }
        public LoginResponse build() { return new LoginResponse(token, id, name, email, role, phone, address, createdAt, status, avatarInitials); }
    }
}
