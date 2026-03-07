// ─── Database Seed Script ─────────────────────────
// Seeds the database with sample crops and an admin user

import prisma from "../config/database.js";
import bcrypt from "bcryptjs";

const seedDatabase = async () => {
    console.log("🌱 Seeding database...\n");

    try {
        // ─── Create Admin User ─────────────────────────
        const hashedPassword = await bcrypt.hash("admin123", 12);
        const admin = await prisma.user.upsert({
            where: { email: "admin@smartkheti.com" },
            update: {},
            create: {
                name: "SmartKheti Admin",
                email: "admin@smartkheti.com",
                password: hashedPassword,
                role: "ADMIN",
            },
        });
        console.log(`✅ Admin user created: ${admin.email}`);

        // ─── Create Sample Crops ───────────────────────
        const crops = [
            {
                name: "Wheat (Triticum)",
                category: "Cereal Grain",
                image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
                description: "Wheat is a cereal grain and one of the most important staple crops globally. It is used for making flour, bread, pasta, and many other food products.",
                growingDuration: "120 - 150 Days",
                season: "RABI",
                soilType: "Well-drained Loamy",
                waterRequirement: "Moderate",
                yield: "4-5 Tons/Hectare",
                majorRegions: "Punjab, Haryana, Uttar Pradesh, Rajasthan",
                geoMajorStates: "Punjab, Haryana, Uttar Pradesh, Rajasthan, Madhya Pradesh",
                geoProductionNotes: "Best grown in winter season with moderate rainfall",
                geoRegionHighlight: "Indo-Gangetic plains are the most productive regions",
                soilPhMin: 6.0,
                soilPhMax: 7.5,
                soilPreparation: "Deep ploughing followed by 2-3 harrowing operations",
                soilTestingTips: "Check for nitrogen and phosphorus levels before sowing",
                weatherTempRange: "15-25°C",
                weatherRainfall: "500-750 mm",
                weatherHumidity: "50-60%",
                weatherWarningAlert: "Frost sensitive during germination stage",
                irrigationMethod: "Sprinkler",
                irrigationFrequency: "Every 10-15 days",
                irrigationSavingTips: "Use mulch to retain soil moisture effectively",
                irrigationSmartTech: "Soil moisture sensors",
                irrigationSubSurface: "Yes",
                seedVariety: "HD 2967",
                seedIsHybrid: true,
                seedRate: "40 kg/acre",
                seedTreatment: "Treat with Thiram or Carbendazim fungicides before sowing",
                diseaseName: "Wheat Rust",
                diseaseSymptoms: "Orange/brown pustules on leaves and stems",
                diseasePrevention: "Use resistant varieties and timely sowing",
                diseaseTreatment: "Mancozeb 75% WP spray at 2g/litre",
                marketAvgPrice: 2200,
                marketPeakSeason: "April - May",
                marketPriceTrend: "Stable",
                bizSeedCost: 1500,
                bizFertilizerCost: 2500,
                bizLaborCost: 4000,
                bizIrrigationCost: 1000,
                bizExpectedYield: 20,
            },
            {
                name: "Rice (Oryza Sativa)",
                category: "Cereal Grain",
                image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400",
                description: "Rice is the primary food crop and staple grain for more than half the world's population. India is the second-largest producer of rice globally.",
                growingDuration: "100 - 150 Days",
                season: "KHARIF",
                soilType: "Clayey Loam",
                waterRequirement: "High",
                yield: "3-6 Tons/Hectare",
                majorRegions: "West Bengal, Uttar Pradesh, Punjab, Andhra Pradesh",
                geoMajorStates: "West Bengal, Uttar Pradesh, Punjab, Andhra Pradesh, Tamil Nadu",
                geoProductionNotes: "Requires standing water during growth phase",
                geoRegionHighlight: "Coastal and deltaic regions are highly productive",
                soilPhMin: 5.5,
                soilPhMax: 6.5,
                soilPreparation: "Puddling and leveling of fields for water retention",
                soilTestingTips: "Test for organic carbon content and zinc levels",
                weatherTempRange: "20-35°C",
                weatherRainfall: "1000-2000 mm",
                weatherHumidity: "70-80%",
                weatherWarningAlert: "Vulnerable to flooding and waterlogging",
                irrigationMethod: "Flood / Drip",
                irrigationFrequency: "Continuous standing water for 2-3 months",
                irrigationSavingTips: "Adopt System of Rice Intensification (SRI)",
                irrigationSmartTech: "Automated water level sensors",
                irrigationSubSurface: "No",
                seedVariety: "Pusa Basmati 1121",
                seedIsHybrid: false,
                seedRate: "20-25 kg/acre",
                seedTreatment: "Soak seeds in water for 24 hours before nursery preparation",
                diseaseName: "Rice Blast",
                diseaseSymptoms: "Diamond-shaped lesions on leaves",
                diseasePrevention: "Avoid excess nitrogen fertilization",
                diseaseTreatment: "Tricyclazole 75% WP spray",
                marketAvgPrice: 1900,
                marketPeakSeason: "October - November",
                marketPriceTrend: "Increasing",
                bizSeedCost: 1200,
                bizFertilizerCost: 3000,
                bizLaborCost: 5000,
                bizIrrigationCost: 2000,
                bizExpectedYield: 25,
            },
            {
                name: "Cotton (Gossypium)",
                category: "Cash Crop",
                image: "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=400",
                description: "Cotton is a major cash crop also known as white gold. It is the backbone of the Indian textile industry.",
                growingDuration: "150 - 180 Days",
                season: "KHARIF",
                soilType: "Black Cotton Soil",
                waterRequirement: "Moderate",
                yield: "2-3 Tons/Hectare",
                majorRegions: "Gujarat, Maharashtra, Telangana, Andhra Pradesh",
                geoMajorStates: "Gujarat, Maharashtra, Telangana, Andhra Pradesh, Rajasthan",
                geoProductionNotes: "Rain-fed crop but responds well to irrigation",
                geoRegionHighlight: "Deccan Plateau and Gujarat plains are major cotton belts",
                soilPhMin: 5.5,
                soilPhMax: 8.0,
                soilPreparation: "Deep ploughing in summer for moisture conservation",
                soilTestingTips: "Check for potassium and micronutrient levels",
                weatherTempRange: "21-35°C",
                weatherRainfall: "600-1000 mm",
                weatherHumidity: "40-60%",
                weatherWarningAlert: "Excess rainfall during boll opening causes damage",
                irrigationMethod: "Drip Irrigation",
                irrigationFrequency: "Every 15-20 days",
                irrigationSavingTips: "Drip irrigation saves 30-40% water",
                irrigationSmartTech: "Fertigation systems",
                irrigationSubSurface: "Yes",
                seedVariety: "Bt Cotton",
                seedIsHybrid: true,
                seedRate: "2.5 kg/acre",
                seedTreatment: "Treat seeds with Imidacloprid for sucking pest protection",
                diseaseName: "Cotton Bollworm",
                diseaseSymptoms: "Bore holes in bolls, shed flowers",
                diseasePrevention: "Pheromone traps, refuge crop planting",
                diseaseTreatment: "Chlorantraniliprole spray",
                marketAvgPrice: 6500,
                marketPeakSeason: "November - February",
                marketPriceTrend: "Volatile",
                bizSeedCost: 2000,
                bizFertilizerCost: 3500,
                bizLaborCost: 6000,
                bizIrrigationCost: 1500,
                bizExpectedYield: 15,
            },
        ];

        for (const crop of crops) {
            await prisma.crop.create({ data: crop });
        }

        console.log(`✅ ${crops.length} sample crops created`);
        console.log("\n🌾 Database seeded successfully!");
        console.log("\n📋 Admin credentials:");
        console.log("   Email:    admin@smartkheti.com");
        console.log("   Password: admin123\n");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};

seedDatabase();
