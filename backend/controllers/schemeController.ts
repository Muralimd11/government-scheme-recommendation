import { Request, Response } from "express";
import { Scheme } from "../models/Scheme";

export async function getSchemes(req: Request, res: Response): Promise<void> {
  try {
    const {
      search,
      category,
      department,
      governmentLevel,
      district,
      crop,
      page = 1,
      limit = 10,
      sortBy = "schemeName"
    } = req.query;

    const filter: Record<string, any> = { status: "ACTIVE" };

    if (search) {
      const searchRegex = new RegExp(String(search).trim(), "i");
      filter.$or = [
        { schemeName: searchRegex },
        { schemeNameTamil: searchRegex },
        { department: searchRegex },
        { category: searchRegex },
        { description: searchRegex }
      ];
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (department && department !== "All") {
      filter.department = department;
    }

    if (governmentLevel && governmentLevel !== "All") {
      filter.governmentLevel = governmentLevel;
    }

    if (district && district !== "All") {
      filter.applicableDistricts = { $in: ["All", district] };
    }

    if (crop && crop !== "All") {
      filter.cropTypes = { $in: ["All", crop] };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [schemes, total] = await Promise.all([
      Scheme.find(filter)
        .sort({ [String(sortBy)]: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Scheme.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        schemes,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to fetch schemes." });
  }
}

export async function getSchemeById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const scheme = await Scheme.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { schemeId: id.toUpperCase() }]
    });

    if (!scheme) {
      res.status(404).json({ success: false, message: "Government scheme not found." });
      return;
    }

    res.status(200).json({
      success: true,
      data: { scheme }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
