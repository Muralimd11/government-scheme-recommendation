import { User } from "../models/User";
import { Application } from "../models/Application";
import { Scheme } from "../models/Scheme";

export async function generateReportData(reportType: string, options: any = {}) {
  switch (reportType) {
    case "FARMERS": {
      const farmers = await User.find({ role: "FARMER" })
        .select("fullName mobile email district landSize cropType farmerType annualIncome createdAt")
        .lean();
      
      const csvHeader = "ID,Full Name,Mobile,Email,District,Land Size (Acres),Crop,Farmer Type,Income,Registration Date\n";
      const csvRows = farmers.map((f: any) =>
        `"${f._id}","${f.fullName}","${f.mobile}","${f.email}","${f.district}",${f.landSize},"${f.cropType}","${f.farmerType}",${f.annualIncome},"${new Date(f.createdAt).toLocaleDateString()}"`
      ).join("\n");

      return {
        type: "FARMERS",
        title: "Farmer Registration Report",
        csv: csvHeader + csvRows,
        data: farmers,
        total: farmers.length
      };
    }

    case "APPLICATIONS": {
      const applications = await Application.find()
        .populate("farmerId", "fullName mobile district")
        .populate("schemeId", "schemeName schemeId department")
        .sort({ submittedDate: -1 })
        .lean();

      const csvHeader = "Application ID,Farmer Name,District,Scheme Code,Scheme Name,Status,Verification,Submitted Date\n";
      const csvRows = applications.map((a: any) => {
        const farmerName = a.farmerId?.fullName || "Unknown";
        const district = a.farmerId?.district || "Unknown";
        return `"${a.applicationId}","${farmerName}","${district}","${a.schemeCode}","${a.schemeName}","${a.status}","${a.verificationStatus}","${new Date(a.submittedDate).toLocaleDateString()}"`;
      }).join("\n");

      return {
        type: "APPLICATIONS",
        title: "Scheme Applications Status Report",
        csv: csvHeader + csvRows,
        data: applications,
        total: applications.length
      };
    }

    case "DISTRICT_WISE": {
      const districtStats = await User.aggregate([
        { $match: { role: "FARMER" } },
        {
          $group: {
            _id: "$district",
            totalFarmers: { $sum: 1 },
            avgLandSize: { $avg: "$landSize" },
            avgIncome: { $avg: "$annualIncome" }
          }
        },
        { $sort: { totalFarmers: -1 } }
      ]);

      const csvHeader = "District,Total Registered Farmers,Average Land Holding (Acres),Average Annual Income (INR)\n";
      const csvRows = districtStats.map((d: any) =>
        `"${d._id}",${d.totalFarmers},${Number(d.avgLandSize || 0).toFixed(2)},${Math.round(d.avgIncome || 0)}`
      ).join("\n");

      return {
        type: "DISTRICT_WISE",
        title: "District-wise Farmer Demographics Report",
        csv: csvHeader + csvRows,
        data: districtStats,
        total: districtStats.length
      };
    }

    case "SCHEMES": {
      const schemes = await Scheme.find().lean();
      const csvHeader = "Scheme ID,Scheme Name,Level,Department,Category,Status,Income Limit,Land Range\n";
      const csvRows = schemes.map((s: any) =>
        `"${s.schemeId}","${s.schemeName}","${s.governmentLevel}","${s.department}","${s.category}","${s.status}",${s.incomeLimit || "None"},"${s.landholdingMin}-${s.landholdingMax}"`
      ).join("\n");

      return {
        type: "SCHEMES",
        title: "Government Schemes Master Report",
        csv: csvHeader + csvRows,
        data: schemes,
        total: schemes.length
      };
    }

    default:
      throw new Error("Invalid report type requested.");
  }
}
