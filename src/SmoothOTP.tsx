import React, { useState, useRef, useEffect, useCallback } from "react";
import "./styles.css";

export interface SmoothOTPProps {
  length?: number;
  onComplete: (otp: string) => void;
  type?: "slots" | "single-field" | "separated";
  className?: string;
  inputClassName?: string;
  spacing?: number | string;
  separator?: string;
}

export const SmoothOTP: React.FC<SmoothOTPProps> = ({
  length = 6,
  onComplete,
  type = "slots",
  className = "",
  inputClassName = "",
  spacing = 2,
  separator = "-",
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const setInputFocus = useCallback((index: number) => {
    const input = inputRefs.current[index];
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    if (type === "slots" || type === "separated") {
      newOtp[index] = value.substring(value.length - 1);
    } else {
      newOtp[index] = value;
    }
    setOtp(newOtp);

    if (
      (type === "slots" || type === "separated") &&
      value &&
      index < length - 1
    ) {
      setInputFocus(index + 1);
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
      setInputFocus(index - 1);
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("Text").replace(/\D/g, "");
    const newOtp = [...otp];

    if (type === "slots" || type === "separated") {
      for (let i = 0; i < pastedData.length && i < length; i++) {
        newOtp[i] = pastedData[i];
      }
      const lastPastedIndex = Math.min(
        index + pastedData.length - 1,
        length - 1,
      );
      setInputFocus(lastPastedIndex);
    } else {
      newOtp[0] = pastedData.slice(0, length);
      setInputFocus(0);
    }
    setOtp(newOtp);

    if (newOtp.every((v) => v !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const renderInputs = () => {
    if (type === "slots") {
      return otp.map((digit, index) => (
        <React.Fragment key={index}>
          <input
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
            onPaste={(e) => handlePaste(e, index)}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={digit === "" ? "true" : "false"}
            required
          />
          {index < length - 1 && separator && (
            <span className="mx-1" aria-hidden="true">
              {separator}
            </span>
          )}
        </React.Fragment>
      ));
    } else if (type === "separated") {
      const halfLength = Math.ceil(length / 2);
      return (
        <>
          <input
            ref={(el) => (inputRefs.current[0] = el)}
            className={`w-24 h-12 text-center text-xl border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none ${inputClassName}`}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern={`\\d{${halfLength}}`}
            maxLength={halfLength}
            value={otp.slice(0, halfLength).join("")}
            onChange={(e) => handleChange(e, 0)}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            onPaste={(e) => handlePaste(e, 0)}
            aria-label={`First ${halfLength} digits of ${length}-digit code`}
            aria-invalid={
              otp.slice(0, halfLength).join("").length !== halfLength
                ? "true"
                : "false"
            }
            required
          />
          <span className="mx-2" aria-hidden="true">
            {separator}
          </span>
          <input
            ref={(el) => (inputRefs.current[1] = el)}
            className={`w-24 h-12 text-center text-xl border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none ${inputClassName}`}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern={`\\d{${length - halfLength}}`}
            maxLength={length - halfLength}
            value={otp.slice(halfLength).join("")}
            onChange={(e) => handleChange(e, 1)}
            onKeyDown={(e) => handleKeyDown(e, 1)}
            onPaste={(e) => handlePaste(e, 1)}
            aria-label={`Last ${
              length - halfLength
            } digits of ${length}-digit code`}
            aria-invalid={
              otp.slice(halfLength).join("").length !== length - halfLength
                ? "true"
                : "false"
            }
            required
          />
        </>
      );
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
          onPaste={(e) => handlePaste(e, 0)}
          aria-label={`Enter ${length}-digit code`}
          aria-invalid={otp.join("").length !== length ? "true" : "false"}
          required
        />
      );
    }
  };

  return (
    <div
      className={`flex items-center ${
        type === "slots" ? `gap-${spacing}` : ""
      } ${className}`}
      role="group"
      aria-labelledby="otp-label"
    >
      {renderInputs()}
    </div>
  );
};
