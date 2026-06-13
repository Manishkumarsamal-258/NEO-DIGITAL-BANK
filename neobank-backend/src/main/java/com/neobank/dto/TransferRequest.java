package com.neobank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class TransferRequest {
    @NotBlank
    private String fromAccountId;

    private String toAccountNumber;

    private String toBeneficiaryId;

    @Positive
    private Double amount;

    private String description;

    public TransferRequest() {}

    public String getFromAccountId() { return fromAccountId; }
    public void setFromAccountId(String fromAccountId) { this.fromAccountId = fromAccountId; }
    public String getToAccountNumber() { return toAccountNumber; }
    public void setToAccountNumber(String toAccountNumber) { this.toAccountNumber = toAccountNumber; }
    public String getToBeneficiaryId() { return toBeneficiaryId; }
    public void setToBeneficiaryId(String toBeneficiaryId) { this.toBeneficiaryId = toBeneficiaryId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
