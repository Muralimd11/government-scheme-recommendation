import { Request, Response, NextFunction } from "express";

export function validateRegister(req: Request, res: Response, next: NextFunction): void {
  const { fullName, email, mobile, password, confirmPassword } = req.body;

  if (!fullName || !fullName.trim()) {
    res.status(400).json({ success: false, message: "Full Name is required." });
    return;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ success: false, message: "A valid email address is required." });
    return;
  }

  if (!mobile || !/^[6-9]\d{9}$/.test(mobile.trim())) {
    res.status(400).json({ success: false, message: "A valid 10-digit Indian mobile number is required." });
    return;
  }

  if (!password || password.length < 6) {
    res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    return;
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    res.status(400).json({ success: false, message: "Passwords do not match." });
    return;
  }

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const { identifier, email, mobile, password } = req.body;
  const userIdentifier = identifier || email || mobile;

  if (!userIdentifier || !userIdentifier.trim()) {
    res.status(400).json({ success: false, message: "Email or Mobile number is required." });
    return;
  }

  if (!password) {
    res.status(400).json({ success: false, message: "Password is required." });
    return;
  }

  next();
}
