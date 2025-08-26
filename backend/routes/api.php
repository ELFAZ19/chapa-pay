<?php

use App\Http\Controllers\PaymentController;

Route::post('/pay', [PaymentController::class, 'initialize']);
Route::get('/payment/callback', [PaymentController::class, 'callback']);
