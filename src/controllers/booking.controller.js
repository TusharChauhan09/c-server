import mongoose from "mongoose";
import { Booking } from "../models/booking.model.js";
import {
  Hotel,
  Flight,
  Train,
  Bus,
  Taxi,
  Restaurant,
  Guide,
} from "../models/services.model.js";

// Get service model by type
const getServiceModel = (type) => {
  switch (type) {
    case "hotel":
      return Hotel;
    case "flight":
      return Flight;
    case "train":
      return Train;
    case "bus":
      return Bus;
    case "taxi":
      return Taxi;
    case "restaurant":
      return Restaurant;
    case "guide":
      return Guide;
    default:
      return null;
  }
};

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      userName,
      serviceType,
      serviceId,
      serviceName: providedServiceName,
      serviceImage: providedServiceImage,
      bookingDetails,
      basePrice,
      totalPrice,
      paymentId,
      orderId,
      paymentMethod = "razorpay",
    } = req.body;

    // Validate required fields
    if (!userId || !serviceType || !serviceId || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Get service details
    const ServiceModel = getServiceModel(serviceType);
    if (!ServiceModel) {
      return res.status(400).json({
        success: false,
        message: "Invalid service type",
      });
    }

    let serviceName = providedServiceName;
    let serviceImage = providedServiceImage;

    // Try to find service in DB if ID is valid ObjectId
    let service = null;
    if (mongoose.isValidObjectId(serviceId)) {
      try {
        service = await ServiceModel.findById(serviceId);
      } catch (e) {
        console.log("Service lookup failed for ID:", serviceId);
      }
    }

    if (service) {
      serviceName =
        service.name ||
        service.airline ||
        service.operator ||
        service.type ||
        service.model ||
        "Service";
      serviceImage = service.image;
    } else if (!serviceName) {
      return res.status(404).json({
        success: false,
        message: "Service not found and no service details provided",
      });
    }

    // Create booking
    const booking = new Booking({
      userId,
      userEmail,
      userName,
      serviceType,
      serviceId,
      serviceName: serviceName || "Unknown Service",
      serviceImage,
      bookingDetails,
      basePrice: basePrice || totalPrice,
      totalPrice,
      paymentId,
      orderId,
      paymentMethod,
      paymentStatus: paymentId ? "completed" : "pending",
      status: paymentId ? "confirmed" : "pending",
      confirmationDate: paymentId ? new Date() : null,
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        bookingId: booking._id,
        confirmationCode: booking.confirmationCode,
        status: booking.status,
        serviceName: booking.serviceName,
        totalPrice: booking.totalPrice,
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 20 } = req.query;

    let query = { userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ bookingDate: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
    });
  }
};

// Get booking by confirmation code
export const getBookingByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const booking = await Booking.findOne({ confirmationCode: code });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, cancellationReason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = status;

    if (status === "cancelled") {
      booking.cancellationDate = new Date();
      booking.cancellationReason = cancellationReason;
    }

    if (status === "confirmed") {
      booking.confirmationDate = new Date();
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking status updated",
      data: booking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking",
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentStatus, paymentId, orderId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.paymentStatus = paymentStatus;
    if (paymentId) booking.paymentId = paymentId;
    if (orderId) booking.orderId = orderId;

    // Auto-confirm on successful payment
    if (paymentStatus === "completed") {
      booking.status = "confirmed";
      booking.confirmationDate = new Date();
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated",
      data: booking,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if booking can be cancelled
    if (booking.status === "completed" || booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking cannot be cancelled",
      });
    }

    booking.status = "cancelled";
    booking.cancellationDate = new Date();
    booking.cancellationReason = reason || "Cancelled by user";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};

// Get booking statistics (admin)
export const getBookingStats = async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: "$serviceType",
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
      { $sort: { totalBookings: -1 } },
    ]);

    const overallStats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byService: stats,
        overall: overallStats[0] || {
          totalBookings: 0,
          totalRevenue: 0,
          confirmedBookings: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
};
