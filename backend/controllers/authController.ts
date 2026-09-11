import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || "tn_farmer_scheme_jwt_secret_key_2026";

function generateToken(user: any) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const {
      fullName,
      email,
      mobile,
      password,
      district,
      block,
      village,
      age,
      gender,
      preferredLanguage,
      farmerStatus,
      landOwnership,
      landSize,
      cropType,
      farmingType,
      irrigationType,
      farmerType,
      annualIncome,
      socialCategory,
      soilType,
      croppingSeason,
      pmKisanBeneficiary,
      kisanCreditCard,
      soilHealthCard,
      solarPumpInterest,
      differentlyAbled,
      cowCount,
      goatCount,
      poultryCount,
      organicCertified,
      livestockOwnership,
      horticultureActivity,
      machineryOwnership
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { mobile: mobile.trim() }]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase().trim()) {
        res.status(400).json({ success: false, message: "An account with this email already exists." });
        return;
      }
      res.status(400).json({ success: false, message: "An account with this mobile number already exists." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const randomRegNum = Math.floor(10000 + Math.random() * 90000);
    const farmerRegistrationId = `TN-FRM-2026-${randomRegNum}`;

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      passwordHash,
      role: "FARMER",
      preferredLanguage: preferredLanguage || "en",
      district: district || "Thanjavur",
      block: block || "Thanjavur",
      village: village || "Vallam",
      age: Number(age) || 45,
      gender: gender || "Male",
      farmerStatus: farmerStatus || "Owner",
      landOwnership: landOwnership || "Owned",
      landSize: Number(landSize) || 2.5,
      cropType: cropType || "Paddy",
      farmingType: farmingType || "Conventional",
      irrigationType: irrigationType || "Canal",
      farmerType: farmerType || (Number(landSize) <= 2.5 ? "Marginal" : Number(landSize) <= 5.0 ? "Small" : "Medium"),
      annualIncome: Number(annualIncome) || 120000,
      socialCategory: socialCategory || "OBC",
      soilType: soilType || "Alluvial / Loamy",
      croppingSeason: croppingSeason || "Samba",
      pmKisanBeneficiary: Boolean(pmKisanBeneficiary),
      kisanCreditCard: Boolean(kisanCreditCard),
      soilHealthCard: Boolean(soilHealthCard),
      solarPumpInterest: Boolean(solarPumpInterest),
      differentlyAbled: Boolean(differentlyAbled),
      cowCount: Number(cowCount) || 0,
      goatCount: Number(goatCount) || 0,
      poultryCount: Number(poultryCount) || 0,
      organicCertified: Boolean(organicCertified),
      livestockOwnership: Boolean(livestockOwnership) || (Number(cowCount) > 0 || Number(goatCount) > 0 || Number(poultryCount) > 0),
      horticultureActivity: Boolean(horticultureActivity),
      machineryOwnership: Boolean(machineryOwnership),
      farmerRegistrationId
    });

    const token = generateToken(newUser);
    const userSafe = newUser.toObject();
    delete (userSafe as any).passwordHash;

    res.status(201).json({
      success: true,
      message: "Farmer registered successfully.",
      data: {
        token,
        user: userSafe
      }
    });
  } catch (error: any) {
    console.error("[Auth Register]", error);
    res.status(500).json({ success: false, message: error.message || "Registration failed." });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { identifier, email, mobile, password } = req.body;
    const loginQuery = (identifier || email || mobile || "").trim().toLowerCase();

    const user = await User.findOne({
      $or: [
        { email: loginQuery },
        { mobile: loginQuery }
      ]
    });

    if (!user) {
      res.status(401).json({ success: false, message: "Invalid email/mobile or password." });
      return;
    }

    if (user.accountStatus === "DISABLED") {
      res.status(403).json({ success: false, message: "Your account is inactive. Please contact the administrator." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid email/mobile or password." });
      return;
    }

    const token = generateToken(user);
    const userSafe = user.toObject();
    delete (userSafe as any).passwordHash;

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: userSafe
      }
    });
  } catch (error: any) {
    console.error("[Auth Login]", error);
    res.status(500).json({ success: false, message: error.message || "Login failed." });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { identifier } = req.body;
  res.status(200).json({
    success: true,
    message: "If an account exists with this credential, password reset instructions have been dispatched via SMS/Email."
  });
}
