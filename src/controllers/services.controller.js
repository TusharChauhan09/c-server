import { Hotel, Flight, Train, Bus, Taxi, Restaurant, Guide } from '../models/services.model.js';

// Get all services by type
export const getServices = async (req, res) => {
  try {
    const { type } = req.params;
    const { featured, limit = 20 } = req.query;

    let Model;
    switch (type) {
      case 'hotels': Model = Hotel; break;
      case 'flights': Model = Flight; break;
      case 'trains': Model = Train; break;
      case 'buses': Model = Bus; break;
      case 'taxis': Model = Taxi; break;
      case 'restaurants': Model = Restaurant; break;
      case 'guides': Model = Guide; break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid service type' });
    }

    let query = {};
    if (featured === 'true') {
      query.featured = true;
    }

    const services = await Model.find(query).limit(parseInt(limit)).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
};

// Get single service by ID
export const getServiceById = async (req, res) => {
  try {
    const { type, id } = req.params;

    let Model;
    switch (type) {
      case 'hotel': Model = Hotel; break;
      case 'flight': Model = Flight; break;
      case 'train': Model = Train; break;
      case 'bus': Model = Bus; break;
      case 'taxi': Model = Taxi; break;
      case 'restaurant': Model = Restaurant; break;
      case 'guide': Model = Guide; break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid service type' });
    }

    const service = await Model.findById(id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch service' });
  }
};

// Search services
export const searchServices = async (req, res) => {
  try {
    const { type } = req.params;
    const { from, to, date, location, query: searchQuery } = req.query;

    let Model;
    switch (type) {
      case 'hotels': Model = Hotel; break;
      case 'flights': Model = Flight; break;
      case 'trains': Model = Train; break;
      case 'buses': Model = Bus; break;
      case 'taxis': Model = Taxi; break;
      case 'restaurants': Model = Restaurant; break;
      case 'guides': Model = Guide; break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid service type' });
    }

    let filter = {};

    // Location-based search for hotels, restaurants, guides
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // From/To search for flights, trains, buses
    if (from) {
      filter.from = { $regex: from, $options: 'i' };
    }
    if (to) {
      filter.to = { $regex: to, $options: 'i' };
    }

    // General search query
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { location: { $regex: searchQuery, $options: 'i' } },
        { airline: { $regex: searchQuery, $options: 'i' } },
        { operator: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    const services = await Model.find(filter).limit(20);
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({ success: false, message: 'Failed to search services' });
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
      Guide.deleteMany({})
    ]);

    // Seed Hotels
    const hotels = await Hotel.insertMany([
      { name: "Taj Palace Hotel", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop", location: "New Delhi", rating: 4.8, price: "₹8,500", priceValue: 8500, amenities: ["Pool", "Spa", "WiFi", "Gym"], greenScore: "92/100", description: "Experience royal luxury at the iconic Taj Palace, featuring world-class amenities and impeccable service.", featured: true },
      { name: "The Oberoi", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop", location: "Mumbai", rating: 4.9, price: "₹12,000", priceValue: 12000, amenities: ["Ocean View", "Fine Dining", "Butler Service"], greenScore: "88/100", description: "Luxurious beachfront property with stunning ocean views and personalized butler service.", featured: true },
      { name: "ITC Grand Chola", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop", location: "Chennai", rating: 4.7, price: "₹9,500", priceValue: 9500, amenities: ["Heritage", "Spa", "Multiple Restaurants"], description: "A tribute to South Indian heritage with modern luxury and world-class hospitality." },
      { name: "Leela Palace", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop", location: "Bangalore", rating: 4.8, price: "₹11,000", priceValue: 11000, amenities: ["Rooftop Pool", "Spa", "Business Center"], greenScore: "95/100", description: "Sophisticated urban sanctuary offering unparalleled luxury in the heart of the city.", featured: true },
    ]);

    // Seed Flights
    const flights = await Flight.insertMany([
      { airline: "IndiGo", from: "Delhi", to: "Mumbai", departure: "06:00", arrival: "08:15", duration: "2h 15m", price: "₹4,500", priceValue: 4500, class: "Economy", stops: "Non-stop", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop" },
      { airline: "Air India", from: "Mumbai", to: "Bangalore", departure: "10:30", arrival: "12:15", duration: "1h 45m", price: "₹5,200", priceValue: 5200, class: "Economy", stops: "Non-stop", image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&auto=format&fit=crop" },
      { airline: "Vistara", from: "Delhi", to: "Goa", departure: "14:00", arrival: "16:30", duration: "2h 30m", price: "₹6,800", priceValue: 6800, class: "Business", stops: "Non-stop", image: "https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=800&auto=format&fit=crop" },
      { airline: "SpiceJet", from: "Chennai", to: "Kolkata", departure: "08:45", arrival: "11:00", duration: "2h 15m", price: "₹3,900", priceValue: 3900, class: "Economy", stops: "Non-stop", image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&auto=format&fit=crop" },
    ]);

    // Seed Trains
    const trains = await Train.insertMany([
      { name: "Rajdhani Express", trainNo: "12301", from: "New Delhi", to: "Mumbai Central", departure: "16:55", arrival: "08:35", duration: "15h 40m", price: "₹2,100", priceValue: 2100, class: "3A", availability: "Available", image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&auto=format&fit=crop" },
      { name: "Shatabdi Express", trainNo: "12002", from: "New Delhi", to: "Bhopal", departure: "06:15", arrival: "14:00", duration: "7h 45m", price: "₹1,200", priceValue: 1200, class: "CC", availability: "RAC", image: "https://images.unsplash.com/photo-1532105956626-9569c03602f6?w=800&auto=format&fit=crop" },
      { name: "Duronto Express", trainNo: "12213", from: "Mumbai", to: "Delhi", departure: "23:00", arrival: "15:55", duration: "16h 55m", price: "₹1,800", priceValue: 1800, class: "2A", availability: "Available", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop" },
      { name: "Vande Bharat", trainNo: "22436", from: "Chennai", to: "Bangalore", departure: "05:50", arrival: "10:35", duration: "4h 45m", price: "₹1,500", priceValue: 1500, class: "CC", availability: "Waitlist", image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop" },
    ]);

    // Seed Buses
    const buses = await Bus.insertMany([
      { operator: "VRL Travels", type: "Volvo Multi-Axle", from: "Bangalore", to: "Hyderabad", departure: "22:00", arrival: "06:00", duration: "8h", price: "₹1,200", priceValue: 1200, seats: 23, rating: 4.5, image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop" },
      { operator: "SRS Travels", type: "Sleeper", from: "Mumbai", to: "Goa", departure: "20:00", arrival: "08:00", duration: "12h", price: "₹900", priceValue: 900, seats: 15, rating: 4.2, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop" },
      { operator: "Orange Travels", type: "AC Seater", from: "Chennai", to: "Bangalore", departure: "23:30", arrival: "05:30", duration: "6h", price: "₹650", priceValue: 650, seats: 30, rating: 4.3, image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop" },
      { operator: "KSRTC", type: "Airavat Club Class", from: "Bangalore", to: "Mysore", departure: "07:00", arrival: "10:00", duration: "3h", price: "₹450", priceValue: 450, seats: 40, rating: 4.6, image: "https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&auto=format&fit=crop" },
    ]);

    // Seed Taxis
    const taxis = await Taxi.insertMany([
      { type: "Sedan", model: "Toyota Camry", capacity: "4 passengers", pricePerKm: "₹15", basePrice: "₹200", basePriceValue: 200, image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop", features: ["AC", "Music System", "GPS"], rating: 4.7 },
      { type: "SUV", model: "Toyota Innova", capacity: "6 passengers", pricePerKm: "₹20", basePrice: "₹300", basePriceValue: 300, image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop", features: ["AC", "Extra Luggage", "GPS"], rating: 4.8 },
      { type: "Luxury", model: "Mercedes E-Class", capacity: "4 passengers", pricePerKm: "₹35", basePrice: "₹500", basePriceValue: 500, image: "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&auto=format&fit=crop", features: ["Premium Leather", "WiFi", "Refreshments"], rating: 4.9 },
      { type: "Electric", model: "Tesla Model 3", capacity: "4 passengers", pricePerKm: "₹18", basePrice: "₹250", basePriceValue: 250, image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop", features: ["Zero Emission", "AC", "Premium Audio"], rating: 4.8, eco: true },
    ]);

    // Seed Restaurants
    const restaurants = await Restaurant.insertMany([
      { name: "Bukhara", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop", cuisine: "North Indian", location: "New Delhi", rating: 4.9, priceRange: "₹₹₹₹", specialty: "Dal Bukhara, Tandoori", description: "World-renowned restaurant serving authentic North Indian cuisine in a rustic setting.", featured: true },
      { name: "Wasabi by Morimoto", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop", cuisine: "Japanese", location: "Mumbai", rating: 4.8, priceRange: "₹₹₹₹", specialty: "Sushi, Omakase", description: "Experience authentic Japanese cuisine crafted by Iron Chef Masaharu Morimoto.", featured: true },
      { name: "Karavalli", image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop", cuisine: "Coastal Karnataka", location: "Bangalore", rating: 4.7, priceRange: "₹₹₹", specialty: "Seafood, Appam", description: "Award-winning coastal cuisine served in a beautiful courtyard setting." },
      { name: "Indian Accent", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop", cuisine: "Modern Indian", location: "New Delhi", rating: 4.9, priceRange: "₹₹₹₹", specialty: "Tasting Menu", description: "Innovative Indian cuisine that reimagines traditional flavors with modern techniques.", featured: true },
    ]);

    // Seed Guides
    const guides = await Guide.insertMany([
      { name: "Rajesh Kumar", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop", location: "Jaipur, Rajasthan", rating: 4.9, tours: 250, specialty: "Heritage & Cultural Tours", languages: ["English", "Hindi", "French"], price: "₹2,500", priceValue: 2500, priceUnit: "/day", description: "Certified heritage guide with 15+ years experience in Rajasthan's royal history.", verified: true },
      { name: "Priya Sharma", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop", location: "Kerala", rating: 4.8, tours: 180, specialty: "Backwaters & Ayurveda", languages: ["English", "Hindi", "Malayalam"], price: "₹2,000", priceValue: 2000, priceUnit: "/day", description: "Expert in Kerala's natural beauty and traditional wellness practices.", verified: true },
      { name: "Amit Patel", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop", location: "Varanasi", rating: 4.9, tours: 320, specialty: "Spiritual & Religious Tours", languages: ["English", "Hindi", "Sanskrit"], price: "₹1,800", priceValue: 1800, priceUnit: "/day", description: "Specialized in spiritual journeys and ancient temple architecture.", verified: true },
      { name: "Meera Reddy", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop", location: "Hampi, Karnataka", rating: 4.7, tours: 150, specialty: "Archaeological Tours", languages: ["English", "Hindi", "Kannada"], price: "₹2,200", priceValue: 2200, priceUnit: "/day", description: "Archaeologist and historian specializing in Vijayanagara Empire heritage." },
    ]);

    res.status(200).json({
      success: true,
      message: 'Services seeded successfully',
      counts: {
        hotels: hotels.length,
        flights: flights.length,
        trains: trains.length,
        buses: buses.length,
        taxis: taxis.length,
        restaurants: restaurants.length,
        guides: guides.length
      }
    });
  } catch (error) {
    console.error('Error seeding services:', error);
    res.status(500).json({ success: false, message: 'Failed to seed services', error: error.message });
  }
};