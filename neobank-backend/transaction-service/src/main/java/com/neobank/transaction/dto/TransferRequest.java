package com.neobank.transaction.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TransferRequest {
    @NotBlank private String fromAccountId;
    private String toBeneficiaryId;
    private String toAccountNumber;
    @NotNull private Double amount;
    private String description;
    public String getFromAccountId() { return fromAccountId; }
    public void setFromAccountId(String fromAccountId) { this.fromAccountId = fromAccountId; }
    public String getToBeneficiaryId() { return toBeneficiaryId; }
    public void setToBeneficiaryId(String toBeneficiaryId) { this.toBeneficiaryId = toBeneficiaryId; }
    public String getToAccountNumber() { return toAccountNumber; }
    public void setToAccountNumber(String toAccountNumber) { this.toAccountNumber = toAccountNumber; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}