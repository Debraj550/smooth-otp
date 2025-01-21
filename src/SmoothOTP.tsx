import React from "react";
import { useState, useRef, useEffect } from "react";
import "./styles.css";

export interface SmoothOTPProps {
  length?: number;
  onComplete: (otp: string) => void;
  type?: "slots" | "single-field";
  className?: string;
  inputClassName?: string;
  spacing?: number | string;
}

export const SmoothOTP: React.FC<SmoothOTPProps> = ({
  length = 6,
  onComplete,
  type = "slots",
  className = "",
  inputClassName = "",
  spacing = 2,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    if (type === "slots") {
      newOtp[index] = value.substring(value.length - 1);
    } else {
      newOtp[index] = value;
    }
    setOtp(newOtp);

    if (type === "slots" && value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((v) => v !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const renderInputs = () => {
    if (type === "slots") {
      return otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          className={`w-12 h-12 text-center text-xl border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none ${inputClassName}`}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{1}"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
        />
      ));
    } else {
      return (
        <input
          ref={(el) => (inputRefs.current[0] = el)}
          className={`w-full h-12 text-center text-xl border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none ${inputClassName}`}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern={`\\d{${length}}`}
          maxLength={length}
          value={otp.join("")}
          onChange={(e) => handleChange(e, 0)}
        />
      );
    }
  };

  return (
    <div
      className={`flex ${
        type === "slots" ? `gap-${spacing}` : ""
      } ${className}`}
    >
      {renderInputs()}
    </div>
  );
};
