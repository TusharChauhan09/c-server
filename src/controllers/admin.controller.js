import {
  Hotel,
  Flight,
  Train,
  Bus,
  Taxi,
  Restaurant,
  Guide,
} from "../models/services.model.js";
import { Booking } from "../models/booking.model.js";
import { User } from "../models/user.model.js";
import { SellerRequest } from "../models/sellerRequest.model.js";

// Get service model by type
const getServiceModel = (type) => {
  switch (type) {
    case "hotel":
    case "hotels":
      return Hotel;
    case "flight":
    case "flights":
      return Flight;
    case "train":
    case "trains":
      return Train;
    case "bus":
    case "buses":
      return Bus;
    case "taxi":
    case "taxis":
      return Taxi;
    case "restaurant":
    case "restaurants":
      return Restaurant;
    case "guide":
    case "guides":
      return Guide;
    default:
      return null;
  }
};

// =====================
// DASHBOARD STATS
// =====================
export const getDashboardStats = async (req, res) => {
  try {
    const [
      hotelCount,
      flightCount,
      trainCount,
      busCount,
      taxiCount,
      restaurantCount,
      guideCount,
      bookingStats,
      userCount,
      recentBookings,
      pendingSellerRequests,
    ] = await Promise.all([
      Hotel.countDocuments(),
      Flight.countDocuments(),
      Train.countDocuments(),
      Bus.countDocuments(),
      Taxi.countDocuments(),
      Restaurant.countDocuments(),
      Guide.countDocuments(),
      Booking.aggregate([
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: "$totalPrice" },
            confirmedBookings: {
              $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
            },
            pendingBookings: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            cancelledBookings: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
          },
        },
      ]),
      User.countDocuments(),
      Booking.find().sort({ createdAt: -1 }).limit(10).lean(),
      SellerRequest.countDocuments({ status: "pending" }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        services: {
          hotels: hotelCount,
          flights: flightCount,
          trains: trainCount,
          buses: busCount,
          taxis: taxiCount,
          restaurants: restaurantCount,
          guides: guideCount,
          total:
            hotelCount +
            flightCount +
            trainCount +
            busCount +
            taxiCount +
            restaurantCount +
            guideCount,
        },
        bookings: bookingStats[0] || {
          totalBookings: 0,
          totalRevenue: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
        },
        users: userCount,
        recentBookings,
        pendingSellerRequests,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};

// =====================
// SERVICE CRUD
// =====================

// Get all services (with pagination)
export const getAllServices = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20, search = "" } = req.query;

    const Model = getServiceModel(type);
    if (!Model) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid service type" });
    }

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { airline: { $regex: search, $options: "i" } },
        { operator: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Model.countDocuments(query);
    const services = await Model.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: services,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch services" });
  }
};

// Create service
export const createService = async (req, res) => {
  try {
    const { type } = req.params;
    const Model = getServiceModel(type);

    if (!Model) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid service type" });
    }

    const service = new Model(req.body);
    await service.save();

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create service",
        error: error.message,
      });
  }
};

// Update service
export const updateService = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = getServiceModel(type);

    if (!Model) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid service type" });
    }

    const service = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update service",
        error: error.message,
      });
  }
};

// Delete service
export const deleteService = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = getServiceModel(type);

    if (!Model) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid service type" });
    }

    const service = await Model.findByIdAndDelete(id);

    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete service" });
  }
};

// =====================
// BOOKING MANAGEMENT
// =====================

// Get all bookings (with filters)
export const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, serviceType, search } = req.query;

    let query = {};
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;
    if (search) {
      query.$or = [
        { confirmationCode: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { serviceName: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch bookings" });
  }
};

// Update booking
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update booking" });
  }
};

// Delete booking
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete booking" });
  }
};

// =====================
// USER MANAGEMENT
// =====================

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;

    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, subscriptionTier, subscriptionStatus, standardCredits } =
      req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { role, subscriptionTier, subscriptionStatus, standardCredits },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};
