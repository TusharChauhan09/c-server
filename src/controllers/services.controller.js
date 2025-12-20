import {
  Hotel,
  Flight,
  Train,
  Bus,
  Taxi,
  Restaurant,
  Guide,
  Destination,
} from "../models/services.model.js";

// Get all services by type
export const getServices = async (req, res) => {
  try {
    const { type } = req.params;
    const { featured, limit = 20 } = req.query;

    let Model;
    switch (type) {
      case "hotels":
        Model = Hotel;
        break;
      case "flights":
        Model = Flight;
        break;
      case "trains":
        Model = Train;
        break;
      case "buses":
        Model = Bus;
        break;
      case "taxis":
        Model = Taxi;
        break;
      case "restaurants":
        Model = Restaurant;
        break;
      case "restaurants":
        Model = Restaurant;
        break;
      case "guides":
        Model = Guide;
        break;
      case "destinations":
        Model = Destination;
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid service type" });
    }

    let query = {};
    if (featured === "true") {
      query.featured = true;
    }

    const services = await Model.find(query)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch services" });
  }
};

// Get single service by ID
export const getServiceById = async (req, res) => {
  try {
    const { type, id } = req.params;

    let Model;
    switch (type) {
      case "hotel":
        Model = Hotel;
        break;
      case "flight":
        Model = Flight;
        break;
      case "train":
        Model = Train;
        break;
      case "bus":
        Model = Bus;
        break;
      case "taxi":
        Model = Taxi;
        break;
      case "restaurant":
        Model = Restaurant;
        break;
      case "guide":
        Model = Guide;
        break;
      case "destination":
        Model = Destination;
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid service type" });
    }

    const service = await Model.findById(id);

    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch service" });
  }
};

// Search services
export const searchServices = async (req, res) => {
  try {
    const { type } = req.params;
    const { from, to, date, location, query: searchQuery } = req.query;

    let Model;
    switch (type) {
      case "hotels":
        Model = Hotel;
        break;
      case "flights":
        Model = Flight;
        break;
      case "trains":
        Model = Train;
        break;
      case "buses":
        Model = Bus;
        break;
      case "taxis":
        Model = Taxi;
        break;
      case "restaurants":
        Model = Restaurant;
        break;
      case "guides":
        Model = Guide;
        break;
      case "destinations":
        Model = Destination;
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid service type" });
    }

    let filter = {};

    // Location-based search for hotels, restaurants, guides
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    // From/To search for flights, trains, buses
    if (from) {
      filter.from = { $regex: from, $options: "i" };
    }
    if (to) {
      filter.to = { $regex: to, $options: "i" };
    }

    // General search query
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { location: { $regex: searchQuery, $options: "i" } },
        { airline: { $regex: searchQuery, $options: "i" } },
        { operator: { $regex: searchQuery, $options: "i" } },
        { from: { $regex: searchQuery, $options: "i" } },
        { to: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const services = await Model.find(filter).limit(20);

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Error searching services:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to search services" });
  }
};

// Seed initial data (admin only - for development)
export const seedServices = async (req, res) => {
  try {
    // Clear existing data
    await Promise.all([
      Hotel.deleteMany({}),
      Flight.deleteMany({}),
      Train.deleteMany({}),
      Bus.deleteMany({}),
      Taxi.deleteMany({}),
      Restaurant.deleteMany({}),
      Restaurant.deleteMany({}),
      Guide.deleteMany({}),
      Destination.deleteMany({}),
    ]);

    // Seed Destinations
    const destinations = await Destination.insertMany([
      // --- India ---
      {
        name: "Jaipur, India",
        image:
          "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop",
        category: "Heritage",
        rating: 4.8,
        price: "₹15,000",
        priceValue: 15000,
        description: "The Pink City, exploring royal palaces and forts.",
        greenScore: 82,
        featured: true,
      },
      {
        name: "Shimla, India",
        image:
          "https://images.unsplash.com/photo-1562649534-1c6686a34c9c?w=800&auto=format&fit=crop",
        category: "Hill Station",
        rating: 4.7,
        price: "₹18,000",
        priceValue: 18000,
        description:
          "Queen of Hills, famous for colonial architecture and scenic views.",
        greenScore: 88,
        featured: true,
      },
      {
        name: "Varanasi, India",
        image:
          "https://images.unsplash.com/photo-1561361513-35bd317cc9cd?w=800&auto=format&fit=crop",
        category: "Spiritual",
        rating: 4.7,
        price: "₹12,000",
        priceValue: 12000,
        description: "Spiritual capital of India on the banks of Ganges.",
        greenScore: 75,
        featured: true,
      },
      {
        name: "Kerala, India",
        image:
          "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop",
        category: "Nature",
        rating: 4.9,
        price: "₹25,000",
        priceValue: 25000,
        description: "God's Own Country with serene backwaters.",
        greenScore: 94,
        featured: true,
      },
      {
        name: "Leh-Ladakh, India",
        image:
          "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&auto=format&fit=crop",
        category: "Adventure",
        rating: 4.9,
        price: "₹35,000",
        priceValue: 35000,
        description: "Breathtaking landscapes and high mountain passes.",
        greenScore: 90,
        featured: true,
      },
      {
        name: "Goa, India",
        image:
          "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop",
        category: "Beaches",
        rating: 4.6,
        price: "₹20,000",
        priceValue: 20000,
        description: "Sun, sand, and vibrant nightlife.",
        greenScore: 80,
      },
      {
        name: "Agra, India",
        image:
          "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop",
        category: "Heritage",
        rating: 4.7,
        price: "₹10,000",
        priceValue: 10000,
        description: "Home to the Taj Mahal, a symbol of eternal love.",
        greenScore: 78,
      },
      {
        name: "Manali, India",
        image:
          "https://images.unsplash.com/photo-1589136704179-8b809d4439c0?w=800&auto=format&fit=crop",
        category: "Hill Station",
        rating: 4.6,
        price: "₹15,000",
        priceValue: 15000,
        description:
          "A high-altitude Himalayan resort town famous for its cool climate.",
        greenScore: 85,
      },
      {
        name: "Udaipur, India",
        image:
          "https://images.unsplash.com/photo-1595262768560-6901e149c716?w=800&auto=format&fit=crop",
        category: "Heritage",
        rating: 4.8,
        price: "₹20,000",
        priceValue: 20000,
        description:
          "The City of Lakes, known for its lavish royal residences.",
        greenScore: 80,
      },
      {
        name: "Darjeeling, India",
        image:
          "https://images.unsplash.com/photo-1544634076-a901606f4180?w=800&auto=format&fit=crop",
        category: "Hill Station",
        rating: 4.7,
        price: "₹12,000",
        priceValue: 12000,
        description:
          "Famous for its tea plantations and views of Kanchenjunga.",
        greenScore: 89,
      },
      {
        name: "Rishikesh, India",
        image:
          "https://images.unsplash.com/photo-1588414734732-6602073f96d9?w=800&auto=format&fit=crop",
        category: "Spiritual",
        rating: 4.8,
        price: "₹10,000",
        priceValue: 10000,
        description: "Yoga capital of the world, by the Ganges.",
        greenScore: 85,
      },
      {
        name: "Andaman Islands, India",
        image:
          "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&auto=format&fit=crop",
        category: "Beaches",
        rating: 4.9,
        price: "₹40,000",
        priceValue: 40000,
        description: "Pristine beaches and turquoise waters.",
        greenScore: 92,
      },
      {
        name: "Ooty, India",
        image:
          "https://images.unsplash.com/photo-1510527339035-48cb666114eb?w=800&auto=format&fit=crop",
        category: "Hill Station",
        rating: 4.6,
        price: "₹14,000",
        priceValue: 14000,
        description: "Queen of Hill Stations in the Nilgiris.",
        greenScore: 87,
      },
      {
        name: "Hampi, India",
        image:
          "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?w=800&auto=format&fit=crop",
        category: "Heritage",
        rating: 4.8,
        price: "₹8,000",
        priceValue: 8000,
        description: "Ancient village dotted with ruined temple complexes.",
        greenScore: 82,
      },
      {
        name: "Srinagar, India",
        image:
          "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=800&auto=format&fit=crop",
        category: "Nature",
        rating: 4.7,
        price: "₹22,000",
        priceValue: 22000,
        description: "Summer capital, famous for Dal Lake and houseboats.",
        greenScore: 88,
      },

      // --- International ---
      {
        name: "London, UK",
        image:
          "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop",
        category: "Cities",
        rating: 4.8,
        price: "₹1,80,000",
        priceValue: 180000,
        description:
          "Historic landmarks, royal palaces, and world-class museums.",
        greenScore: 85,
        featured: true,
      },
      {
        name: "Rome, Italy",
        image:
          "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop",
        category: "History",
        rating: 4.9,
        price: "₹1,60,000",
        priceValue: 160000,
        description: "The Eternal City, home to the Colosseum and Vatican.",
        greenScore: 80,
      },
      {
        name: "Singapore",
        image:
          "https://images.unsplash.com/photo-1525625293386-3f8f99389eef?w=800&auto=format&fit=crop",
        category: "Cities",
        rating: 4.9,
        price: "₹95,000",
        priceValue: 95000,
        description: "Futuristic gardens, diverse food scene, and shopping.",
        greenScore: 92,
        featured: true,
      },
      {
        name: "Sydney, Australia",
        image:
          "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop",
        category: "Beaches",
        rating: 4.8,
        price: "₹2,20,000",
        priceValue: 220000,
        description: "Iconic Opera House, harbor views, and surf beaches.",
        greenScore: 89,
      },
      {
        name: "Paris, France",
        image:
          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop",
        category: "Cities",
        rating: 4.9,
        price: "₹1,50,000",
        priceValue: 150000,
        description: "The city of love, art, and fashion.",
        greenScore: 85,
        featured: true,
      },
      {
        name: "New York, USA",
        image:
          "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop",
        category: "Cities",
        rating: 4.8,
        price: "₹2,00,000",
        priceValue: 200000,
        description: "The city that never sleeps, iconic skyline and culture.",
        greenScore: 82,
        featured: true,
      },
      {
        name: "Dubai, UAE",
        image:
          "https://images.unsplash.com/photo-1512453979798-5ea904ac22ac?w=800&auto=format&fit=crop",
        category: "Cities",
        rating: 4.8,
        price: "₹90,000",
        priceValue: 90000,
        description:
          "Modern architecture, luxury shopping, and desert adventures.",
        greenScore: 70,
        featured: true,
      },
      {
        name: "Bali, Indonesia",
        image:
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop",
        category: "Beaches",
        rating: 4.9,
        price: "₹45,000",
        priceValue: 45000,
        description: "Tropical paradise with stunning temples",
        greenScore: 85,
      },
      {
        name: "Swiss Alps",
        image:
          "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&auto=format&fit=crop",
        category: "Mountains",
        rating: 4.8,
        price: "₹1,20,000",
        priceValue: 120000,
        description: "Majestic peaks and scenic villages",
        greenScore: 92,
      },
      {
        name: "Tokyo, Japan",
        image:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop",
        category: "Cities",
        rating: 4.9,
        price: "₹85,000",
        priceValue: 85000,
        description: "Where tradition meets innovation",
        greenScore: 88,
      },
      {
        name: "Kyoto, Japan",
        image:
          "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop",
        category: "Culture",
        rating: 4.9,
        price: "₹90,000",
        priceValue: 90000,
        description:
          "Famous for its classical Buddhist temples and Imperial palaces.",
        greenScore: 91,
      },
      {
        name: "Santorini, Greece",
        image:
          "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop",
        category: "Beaches",
        rating: 4.9,
        price: "₹1,40,000",
        priceValue: 140000,
        description:
          "Iconic white buildings with blue domes overlooking the sea.",
        greenScore: 84,
      },
      {
        name: "Maldives",
        image:
          "https://images.unsplash.com/photo-1514282401047-d77a7149ba99?w=800&auto=format&fit=crop",
        category: "Beaches",
        rating: 4.9,
        price: "₹1,20,000",
        priceValue: 120000,
        description:
          "Private islands with overwater bungalows and crystal clear water.",
        greenScore: 88,
      },
      {
        name: "Cairo, Egypt",
        image:
          "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&auto=format&fit=crop",
        category: "History",
        rating: 4.7,
        price: "₹70,000",
        priceValue: 70000,
        description: "Home to the Giza Pyramids and ancient history.",
        greenScore: 72,
      },
      {
        name: "Istanbul, Turkey",
        image:
          "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop",
        category: "History",
        rating: 4.8,
        price: "₹85,000",
        priceValue: 85000,
        description: "Where East meets West, famous for Hagia Sophia.",
        greenScore: 80,
      },
      {
        name: "Barcelona, Spain",
        image:
          "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop",
        category: "Cities",
        rating: 4.8,
        price: "₹1,10,000",
        priceValue: 110000,
        description: "Famous for Gaudi's architecture and vibrant culture.",
        greenScore: 86,
      },
      {
        name: "Venice, Italy",
        image:
          "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800&auto=format&fit=crop",
        category: "Romance",
        rating: 4.9,
        price: "₹1,70,000",
        priceValue: 170000,
        description: "City of canals and gondolas.",
        greenScore: 80,
      },
      {
        name: "Cape Town, South Africa",
        image:
          "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&auto=format&fit=crop",
        category: "Adventure",
        rating: 4.8,
        price: "₹1,00,000",
        priceValue: 100000,
        description: "Table Mountain views and stunning coastline.",
        greenScore: 85,
      },
      {
        name: "Machu Picchu, Peru",
        image:
          "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&auto=format&fit=crop",
        category: "Adventure",
        rating: 5.0,
        price: "₹2,50,000",
        priceValue: 250000,
        description: "Ancient Incan citadel set high in the Andes Mountains.",
        greenScore: 90,
      },
      {
        name: "Phuket, Thailand",
        image:
          "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&auto=format&fit=crop",
        category: "Beaches",
        rating: 4.7,
        price: "₹45,000",
        priceValue: 45000,
        description: "Tropical beaches, islands, and vibrant nightlife.",
        greenScore: 78,
      },
    ]);
    const hotels = await Hotel.insertMany([
      // --- India Hotels ---
      {
        name: "Taj Palace Hotel",
        image:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
        location: "New Delhi",
        rating: 4.8,
        price: "₹8,500",
        priceValue: 8500,
        amenities: ["Pool", "Spa", "WiFi", "Gym"],
        greenScore: "92/100",
        description:
          "Experience royal luxury at the iconic Taj Palace, featuring world-class amenities and impeccable service.",
        featured: true,
      },
      {
        name: "Wildflower Hall",
        image:
          "https://images.unsplash.com/photo-1548674213-f7267eb954a6?w=800&auto=format&fit=crop",
        location: "Shimla",
        rating: 4.9,
        price: "₹25,000",
        priceValue: 25000,
        amenities: ["Mountain View", "Spa", "Heated Pool"],
        greenScore: "95/100",
        description:
          "An Oberoi Resort in Shimla, offering fairy tale luxury in the Himalayas with pine forest views.",
        featured: true,
      },
      {
        name: "The Oberoi",
        image:
          "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop",
        location: "Mumbai",
        rating: 4.9,
        price: "₹12,000",
        priceValue: 12000,
        amenities: ["Ocean View", "Fine Dining", "Butler Service"],
        greenScore: "88/100",
        description:
          "Luxurious beachfront property with stunning ocean views and personalized butler service.",
        featured: true,
      },
      {
        name: "Taj Lake Palace",
        image:
          "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&auto=format&fit=crop",
        location: "Udaipur",
        rating: 5.0,
        price: "₹45,000",
        priceValue: 45000,
        amenities: ["Lake View", "Historic", "Boat Ride"],
        greenScore: "90/100",
        description: "A marble palace floating on Lake Pichola.",
        featured: true,
      },
      {
        name: "Rambagh Palace",
        image:
          "https://images.unsplash.com/photo-1590073844006-33379778ae09?w=800&auto=format&fit=crop",
        location: "Jaipur",
        rating: 4.9,
        price: "₹35,000",
        priceValue: 35000,
        amenities: ["Heritage", "Gardens", "Peacocks"],
        greenScore: "92/100",
        description: "The former residence of the Maharaja of Jaipur.",
      },
      {
        name: "The Leela Kovalam",
        image:
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop",
        location: "Kerala",
        rating: 4.8,
        price: "₹18,000",
        priceValue: 18000,
        amenities: ["Clifftop View", "Beach Access", "Ayurveda"],
        greenScore: "94/100",
        description: "India's only clifftop beach resort.",
      },
      {
        name: "Span Resort and Spa",
        image:
          "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop",
        location: "Manali",
        rating: 4.7,
        price: "₹15,000",
        priceValue: 15000,
        amenities: ["River View", "Spa", "Adventure Sports"],
        greenScore: "90/100",
        description:
          "Riverside resort offering stunning views of the Beas river and mountains.",
      },
      {
        name: "BrijRama Palace",
        image:
          "https://images.unsplash.com/photo-1560185007-cde436f6a4d7?w=800&auto=format&fit=crop",
        location: "Varanasi",
        rating: 4.8,
        price: "₹14,000",
        priceValue: 14000,
        amenities: ["Ghat View", "Heritage", "Vegetarian Dining"],
        greenScore: "85/100",
        description: "Heritage hotel on the banks of the Ganges.",
      },
      {
        name: "Taj Exotica",
        image:
          "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=800&auto=format&fit=crop",
        location: "Andaman Islands",
        rating: 4.9,
        price: "₹30,000",
        priceValue: 30000,
        amenities: ["Private Beach", "Villas", "Diving"],
        greenScore: "96/100",
        description:
          "Luxurious resort on Havelock Island with direct beach access.",
      },
      {
        name: "Savoy",
        image:
          "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&auto=format&fit=crop",
        location: "Ooty",
        rating: 4.5,
        price: "₹8,000",
        priceValue: 8000,
        amenities: ["Colonial", "Gardens", "Fireplace"],
        greenScore: "88/100",
        description: "Historic hotel with colonial charm in the Nilgiris.",
      },

      // --- International Hotels ---
      {
        name: "The Ritz London",
        image:
          "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop",
        location: "London, UK",
        rating: 4.9,
        price: "₹85,000",
        priceValue: 85000,
        amenities: ["Historic", "Afternoon Tea", "Concierge"],
        greenScore: "85/100",
        description:
          "World-famous hotel overlooking Green Park, known for its neoclassical style.",
        featured: true,
      },
      {
        name: "Burj Al Arab",
        image:
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
        location: "Dubai, UAE",
        rating: 5.0,
        price: "₹1,50,000",
        priceValue: 150000,
        amenities: ["Helipad", "Private Beach", "Butler"],
        greenScore: "80/100",
        description: "The world's most luxurious hotel, shaped like a sail.",
        featured: true,
      },
      {
        name: "Marina Bay Sands",
        image:
          "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&auto=format&fit=crop",
        location: "Singapore",
        rating: 4.8,
        price: "₹60,000",
        priceValue: 60000,
        amenities: ["Infinity Pool", "Casino", "SkyPark"],
        greenScore: "90/100",
        description:
          "Iconic hotel with the world's largest rooftop infinity pool.",
        featured: true,
      },
      {
        name: "The Plaza",
        image:
          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop",
        location: "New York, USA",
        rating: 4.9,
        price: "₹95,000",
        priceValue: 95000,
        amenities: ["Central Park View", "Historic", "Spa"],
        greenScore: "78/100",
        description:
          "A castle on Central Park South, an icon of New York luxury.",
        featured: true,
      },
      {
        name: "Hotel Ritz Paris",
        image:
          "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800&auto=format&fit=crop",
        location: "Paris, France",
        rating: 5.0,
        price: "₹1,80,000",
        priceValue: 180000,
        amenities: ["Historic", "Michelin Dining", "Garden"],
        greenScore: "82/100",
        description:
          "Legendary hotel at Place Vendôme, a symbol of high society.",
        featured: true,
      },
      {
        name: "ITC Grand Chola",
        image:
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop",
        location: "Chennai",
        rating: 4.7,
        price: "₹9,500",
        priceValue: 9500,
        amenities: ["Heritage", "Spa", "Multiple Restaurants"],
        description:
          "A tribute to South Indian heritage with modern luxury and world-class hospitality.",
        greenScore: "85/100",
      },
      {
        name: "Leela Palace",
        image:
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
        location: "Bangalore",
        rating: 4.8,
        price: "₹11,000",
        priceValue: 11000,
        amenities: ["Rooftop Pool", "Spa", "Business Center"],
        greenScore: "95/100",
        description:
          "Sophisticated urban sanctuary offering unparalleled luxury in the heart of the city.",
        featured: true,
      },
      {
        name: "Aman Tokyo",
        image:
          "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop",
        location: "Tokyo, Japan",
        rating: 4.9,
        price: "₹1,10,000",
        priceValue: 110000,
        amenities: ["City View", "Zen Garden", "Spa"],
        greenScore: "89/100",
        description:
          "High above the Otemachi district, blends urban dynamism with cultural serenity.",
      },
      {
        name: "Katikies Hotel",
        image:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
        location: "Santorini, Greece",
        rating: 4.9,
        price: "₹75,000",
        priceValue: 75000,
        amenities: ["Caldera View", "Infinity Pool", "White Cave Rooms"],
        greenScore: "88/100",
        description:
          "Luxury boutique hotel with breathtaking views of the Aegean Sea.",
      },
      {
        name: "Soneva Jani",
        image:
          "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&auto=format&fit=crop",
        location: "Maldives",
        rating: 4.9,
        price: "₹1,50,000",
        priceValue: 150000,
        amenities: ["Overwater Villas", "Water Slide", "Stargazing"],
        greenScore: "95/100",
        description: "Iconic overwater villas in a turquoise lagoon.",
      },
      {
        name: "Mena House",
        image:
          "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&auto=format&fit=crop",
        location: "Cairo",
        rating: 4.8,
        price: "₹30,000",
        priceValue: 30000,
        amenities: ["Pyramid View", "Historic", "Gardens"],
        greenScore: "75/100",
        description: "Historic hotel with direct views of the Great Pyramids.",
      },
      {
        name: "Shangri-La Paris",
        image:
          "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&auto=format&fit=crop",
        location: "Paris, France",
        rating: 4.9,
        price: "₹1,20,000",
        priceValue: 120000,
        amenities: ["Eiffel Tower View", "Palace", "Spa"],
        greenScore: "80/100",
        description:
          "Former home of Napoleon's grandnephew, offering Eiffel Tower views.",
      },
      {
        name: "Park Hyatt",
        image:
          "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop",
        location: "Sydney",
        rating: 4.9,
        price: "₹90,000",
        priceValue: 90000,
        amenities: ["Harbour View", "Opera House View", "Rooftop Pool"],
        greenScore: "85/100",
        description:
          "Located perfectly between the Opera House and Harbour Bridge.",
      },
      {
        name: "Hoshinoya Kyoto",
        image:
          "https://images.unsplash.com/photo-1601221783301-44ec74722883?w=800&auto=format&fit=crop",
        location: "Kyoto",
        rating: 4.9,
        price: "₹80,000",
        priceValue: 80000,
        amenities: ["River View", "Ryokan", "Kaiseki Dining"],
        greenScore: "92/100",
        description: "A river retreat accessible only by boat.",
      },
      {
        name: "The Gritti Palace",
        image:
          "https://images.unsplash.com/photo-1621601662973-1f558a74df6c?w=800&auto=format&fit=crop",
        location: "Venice",
        rating: 4.9,
        price: "₹1,30,000",
        priceValue: 130000,
        amenities: ["Canal View", "Historic", "Antiques"],
        greenScore: "78/100",
        description: "A 15th-century palazzo on the Grand Canal.",
        featured: true,
      },
      {
        name: "One&Only The Palm",
        image:
          "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop",
        location: "Dubai",
        rating: 4.9,
        price: "₹85,000",
        priceValue: 85000,
        amenities: ["Private Beach", "Secluded", "Michelin Dining"],
        greenScore: "82/100",
        description: "Beachfront sanctuary on the Palm Jumeirah.",
      },
      {
        name: "Silo Hotel",
        image:
          "https://images.unsplash.com/photo-1582234084656-11843b0185f4?w=800&auto=format&fit=crop",
        location: "Cape Town",
        rating: 4.9,
        price: "₹95,000",
        priceValue: 95000,
        amenities: ["Harbour View", "Art", "Rooftop Bar"],
        greenScore: "88/100",
        description: "Built in a grain silo complex above the V&A Waterfront.",
      },
    ]);

    // Seed Flights
    const flights = await Flight.insertMany([
      // Domestic India
      {
        airline: "IndiGo",
        from: "Delhi",
        to: "Mumbai",
        departure: "06:00",
        arrival: "08:15",
        duration: "2h 15m",
        price: "₹4,500",
        priceValue: 4500,
        class: "Economy",
        stops: "Non-stop",
        image:
          "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop",
      },
      {
        airline: "Air India",
        from: "Mumbai",
        to: "Bangalore",
        departure: "10:30",
        arrival: "12:15",
        duration: "1h 45m",
        price: "₹5,200",
        priceValue: 5200,
        class: "Economy",
        stops: "Non-stop",
        image:
          "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&auto=format&fit=crop",
      },
      {
        airline: "Vistara",
        from: "Delhi",
        to: "Goa",
        departure: "14:00",
        arrival: "16:30",
        duration: "2h 30m",
        price: "₹6,800",
        priceValue: 6800,
        class: "Business",
        stops: "Non-stop",
        image:
          "https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=800&auto=format&fit=crop",
      },
      {
        airline: "SpiceJet",
        from: "Chennai",
        to: "Kolkata",
        departure: "08:45",
        arrival: "11:00",
        duration: "2h 15m",
        price: "₹3,900",
        priceValue: 3900,
        class: "Economy",
        stops: "Non-stop",
        image:
          "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&auto=format&fit=crop",
      },
      // International Flights
      {
        airline: "Emirates",
        from: "Mumbai",
        to: "Dubai",
        departure: "04:30",
        arrival: "06:15",
        duration: "3h 15m",
        price: "₹22,000",
        priceValue: 22000,
        class: "Economy",
        stops: "Non-stop",
        image:
          "https://images.unsplash.com/photo-1588169936853-e380e227a923?w=800&auto=format&fit=crop",
      },
      {
        airline: "British Airways",
        from: "Delhi",
        to: "London",
        departure: "02:45",
        arrival: "07:30",
        duration: "9h 15m",
        price: "₹65,000",
        priceValue: 65000,
        class: "Business",
        stops: "Non-stop",
        image:
          "https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=800&auto=format&fit=crop",
      },
      {
        airline: "Air France",
        from: "Mumbai",
        to: "Paris",
        departure: "01:50",
        arrival: "07:25",
        duration: "10h 05m",
        price: "₹55,000",
        priceValue: 55000,
        class: "Economy",
        stops: "1 Stop",
        image:
          "https://images.unsplash.com/photo-1606161290809-56365a6c6df9?w=800&auto=format&fit=crop",
      },
      {
        airline: "United Airlines",
        from: "Delhi",
        to: "New York",
        departure: "23:30",
        arrival: "05:45",
        duration: "15h 15m",
        price: "₹95,000",
        priceValue: 95000,
        class: "Premium Eco",
        stops: "Non-stop",
        image:
          "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800&auto=format&fit=crop",
      },
      {
        airline: "Singapore Airlines",
        from: "Chennai",
        to: "Singapore",
        departure: "22:15",
        arrival: "05:10",
        duration: "4h 25m",
        price: "₹28,000",
        priceValue: 28000,
        class: "Economy",
        stops: "Non-stop",
        image:
          "https://images.unsplash.com/photo-1582264626786-9ac63b655762?w=800&auto=format&fit=crop",
      },
      {
        airline: "Qantas",
        from: "Bangalore",
        to: "Sydney",
        departure: "18:20",
        arrival: "14:10",
        duration: "15h 20m",
        price: "₹82,000",
        priceValue: 82000,
        class: "Economy",
        stops: "1 Stop",
        image:
          "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=800&auto=format&fit=crop",
      },
    ]);

    // Seed Trains
    const trains = await Train.insertMany([
      {
        name: "Rajdhani Express",
        trainNo: "12301",
        from: "New Delhi",
        to: "Mumbai Central",
        departure: "16:55",
        arrival: "08:35",
        duration: "15h 40m",
        price: "₹2,100",
        priceValue: 2100,
        class: "3A",
        availability: "Available",
        image:
          "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&auto=format&fit=crop",
      },
      {
        name: "Shatabdi Express",
        trainNo: "12002",
        from: "New Delhi",
        to: "Bhopal",
        departure: "06:15",
        arrival: "14:00",
        duration: "7h 45m",
        price: "₹1,200",
        priceValue: 1200,
        class: "CC",
        availability: "RAC",
        image:
          "https://images.unsplash.com/photo-1532105956626-9569c03602f6?w=800&auto=format&fit=crop",
      },
      {
        name: "Himalayan Queen",
        trainNo: "52455",
        from: "Kalka",
        to: "Shimla",
        departure: "12:10",
        arrival: "17:30",
        duration: "5h 20m",
        price: "₹650",
        priceValue: 650,
        class: "FC",
        availability: "Waitlist",
        image:
          "https://images.unsplash.com/photo-1596500732800-47cb83e44926?w=800&auto=format&fit=crop",
      },
      {
        name: "Gatimaan Express",
        trainNo: "12050",
        from: "Delhi",
        to: "Agra",
        departure: "08:10",
        arrival: "09:50",
        duration: "1h 40m",
        price: "₹1,400",
        priceValue: 1400,
        class: "EC",
        availability: "Available",
        image:
          "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop",
      },
      {
        name: "Eurostar",
        trainNo: "ES9014",
        from: "London",
        to: "Paris",
        departure: "10:24",
        arrival: "13:47",
        duration: "2h 23m",
        price: "₹15,000",
        priceValue: 15000,
        class: "Standard Premier",
        availability: "Available",
        image:
          "https://images.unsplash.com/photo-1555437887-e2154ae929fa?w=800&auto=format&fit=crop",
      },
      {
        name: "Shinkansen",
        trainNo: "Nozomi 1",
        from: "Tokyo",
        to: "Kyoto",
        departure: "08:00",
        arrival: "10:15",
        duration: "2h 15m",
        price: "₹9,500",
        priceValue: 9500,
        class: "Green Car",
        availability: "Available",
        image:
          "https://images.unsplash.com/photo-1582042475475-7b19810a9c7b?w=800&auto=format&fit=crop",
      },
    ]);

    // Seed Buses
    const buses = await Bus.insertMany([
      {
        operator: "VRL Travels",
        type: "Volvo Multi-Axle",
        from: "Bangalore",
        to: "Hyderabad",
        departure: "22:00",
        arrival: "06:00",
        duration: "8h",
        price: "₹1,200",
        priceValue: 1200,
        seats: 23,
        rating: 4.5,
        image:
          "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
      },
      {
        operator: "SRS Travels",
        type: "Sleeper",
        from: "Mumbai",
        to: "Goa",
        departure: "20:00",
        arrival: "08:00",
        duration: "12h",
        price: "₹900",
        priceValue: 900,
        seats: 15,
        rating: 4.2,
        image:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop",
      },
      {
        operator: "HRTC Volvo",
        type: "Volvo AC",
        from: "Delhi",
        to: "Shimla",
        departure: "21:30",
        arrival: "06:00",
        duration: "8h 30m",
        price: "₹1,100",
        priceValue: 1100,
        seats: 28,
        rating: 4.4,
        image:
          "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop",
      },
      {
        operator: "National Express",
        type: "Luxury Coach",
        from: "London",
        to: "Manchester",
        departure: "09:00",
        arrival: "13:30",
        duration: "4h 30m",
        price: "₹1,800",
        priceValue: 1800,
        seats: 45,
        rating: 4.6,
        image:
          "https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&auto=format&fit=crop",
      },
    ]);

    // Seed Taxis
    const taxis = await Taxi.insertMany([
      {
        type: "Sedan",
        model: "Toyota Camry",
        capacity: "4 passengers",
        pricePerKm: "₹15",
        basePrice: "₹200",
        basePriceValue: 200,
        image:
          "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop",
        features: ["AC", "Music System", "GPS"],
        rating: 4.7,
      },
      {
        type: "SUV",
        model: "Toyota Innova Crysta",
        capacity: "6 passengers",
        pricePerKm: "₹22",
        basePrice: "₹400",
        basePriceValue: 400,
        image:
          "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop",
        features: ["AC", "Extra Luggage", "Captain Seats"],
        rating: 4.9,
      },
      {
        type: "Luxury",
        model: "Mercedes E-Class",
        capacity: "4 passengers",
        pricePerKm: "₹50",
        basePrice: "₹1000",
        basePriceValue: 1000,
        image:
          "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&auto=format&fit=crop",
        features: ["Premium Leather", "WiFi", "Refreshments"],
        rating: 4.9,
      },
      {
        type: "London Black Cab",
        model: "TX Electric",
        capacity: "5 passengers",
        pricePerKm: "₹300",
        basePrice: "₹500",
        basePriceValue: 500,
        image:
          "https://images.unsplash.com/photo-1555239169-32219d2825bf?w=800&auto=format&fit=crop",
        features: ["Wheelchair Accessible", "Partition", "Iconic"],
        rating: 4.8,
        eco: true,
      },
    ]);

    // Seed Restaurants
    const restaurants = await Restaurant.insertMany([
      {
        name: "Bukhara",
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop",
        cuisine: "North Indian",
        location: "New Delhi",
        rating: 4.9,
        priceRange: "₹₹₹₹",
        specialty: "Dal Bukhara, Tandoori",
        description:
          "World-renowned restaurant serving authentic North Indian cuisine in a rustic setting.",
        featured: true,
      },
      {
        name: "Le Jules Verne",
        image:
          "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop",
        cuisine: "French",
        location: "Paris",
        rating: 4.8,
        priceRange: "₹₹₹₹₹",
        specialty: "Fine Dining",
        description:
          "Michelin-star dining located on the second floor of the Eiffel Tower.",
        featured: true,
      },
      {
        name: "Karavalli",
        image:
          "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop",
        cuisine: "Coastal Karnataka",
        location: "Bangalore",
        rating: 4.7,
        priceRange: "₹₹₹",
        specialty: "Seafood, Appam",
        description:
          "Award-winning coastal cuisine served in a beautiful courtyard setting.",
      },
      {
        name: "Peter Luger Steak House",
        image:
          "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop",
        cuisine: "American",
        location: "New York",
        rating: 4.8,
        priceRange: "₹₹₹₹",
        specialty: "Dry-aged Steak",
        description:
          "Legendary steakhouse known for its porterhouse and old-school charm.",
        featured: true,
      },
      {
        name: "Nobu Dubai",
        image:
          "https://images.unsplash.com/photo-1512429234316-f731871a48b2?w=800&auto=format&fit=crop",
        cuisine: "Japanese-Peruvian",
        location: "Dubai",
        rating: 4.9,
        priceRange: "₹₹₹₹₹",
        specialty: "Black Cod Miso",
        description:
          "World-famous contemporary Japanese cuisine at Atlantis, The Palm.",
      },
    ]);

    // Seed Guides
    const guides = await Guide.insertMany([
      {
        name: "Rajesh Kumar",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop",
        location: "Jaipur, Rajasthan",
        rating: 4.9,
        tours: 250,
        specialty: "Heritage & Cultural Tours",
        languages: ["English", "Hindi", "French"],
        price: "₹2,500",
        priceValue: 2500,
        priceUnit: "/day",
        description:
          "Certified heritage guide with 15+ years experience in Rajasthan's royal history.",
        verified: true,
      },
      {
        name: "Pierre Dubois",
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
        location: "Paris, France",
        rating: 4.9,
        tours: 420,
        specialty: "Art & History",
        languages: ["French", "English", "Spanish"],
        price: "₹15,000",
        priceValue: 15000,
        priceUnit: "/day",
        description:
          "Expert art historian specializing in Louvre and Orsay museum tours.",
        verified: true,
      },
      {
        name: "Sarah Jenkins",
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop",
        location: "London, UK",
        rating: 4.8,
        tours: 310,
        specialty: "Royal Walking Tours",
        languages: ["English", "German"],
        price: "₹12,000",
        priceValue: 12000,
        priceUnit: "/tour",
        description:
          "Blue Badge guide with insider knowledge of royal palaces and history.",
        verified: true,
      },
      {
        name: "Amit Patel",
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop",
        location: "Varanasi",
        rating: 4.9,
        tours: 320,
        specialty: "Spiritual & Religious Tours",
        languages: ["English", "Hindi", "Sanskrit"],
        price: "₹1,800",
        priceValue: 1800,
        priceUnit: "/day",
        description:
          "Specialized in spiritual journeys and ancient temple architecture.",
        verified: true,
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Services seeded successfully",
      counts: {
        hotels: hotels.length,
        flights: flights.length,
        trains: trains.length,
        buses: buses.length,
        taxis: taxis.length,
        restaurants: restaurants.length,
        restaurants: restaurants.length,
        guides: guides.length,
        destinations: destinations.length,
      },
    });
  } catch (error) {
    console.error("Error seeding services:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed services",
      error: error.message,
    });
  }
};
