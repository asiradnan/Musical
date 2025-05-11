import express from 'express';
import { auth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { upload } from '../controllers/media.js';
import * as instrumentController from '../controllers/instrument.js';
import * as instrumentRentalController from '../controllers/instrumentRental.js';

const router = express.Router();

// Instrument routes
router.post('/instruments', auth, isAdmin, upload.array('images', 5), instrumentController.createInstrument);
router.get('/instruments', instrumentController.getAllInstruments);
router.get('/instruments/:instrumentId', instrumentController.getInstrumentById);
router.put('/instruments/:instrumentId', auth, isAdmin, upload.array('images', 5), instrumentController.updateInstrument);
router.delete('/instruments/:instrumentId', auth, isAdmin, instrumentController.deleteInstrument);
router.get('/instruments/:instrumentId/availability', instrumentController.checkInstrumentAvailability);

// Instrument rental routes
router.post('/rentals', auth, instrumentRentalController.createRental);
router.get('/rentals/user', auth, instrumentRentalController.getUserRentals);
router.get('/rentals/:rentalId', auth, instrumentRentalController.getRentalById);
router.put('/rentals/:rentalId/status', auth, instrumentRentalController.updateRentalStatus);
router.put('/rentals/:rentalId/payment', auth, isAdmin, instrumentRentalController.updatePaymentStatus);
router.get('/instruments/:instrumentId/rentals', auth, isAdmin, instrumentRentalController.getInstrumentRentals);
router.get('/rentals', auth, isAdmin, instrumentRentalController.getAllRentals);
router.put('/rentals/:rentalId/cancel', auth, instrumentRentalController.cancelRental);

export default router;
