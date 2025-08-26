<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\UserPayment;

class PaymentController extends Controller
{
    // Step 1: Initialize payment
    public function initialize(Request $request)
    {
        $tx_ref = 'txn_' . time(); // unique transaction reference
        $amount = "100"; // fixed for now (ETB)
        $currency = "ETB";

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('CHAPA_SECRET_KEY'),
        ])->post('https://api.chapa.co/v1/transaction/initialize', [
            'amount' => $amount,
            'currency' => $currency,
            'email' => "test@gmail.com", // Chapa requires email
            'first_name' => $request->name,
            'last_name' => "User",
            'phone_number' => $request->phone,
            'tx_ref' => $tx_ref,
            'callback_url' => url('/api/payment/callback'),
            'return_url' => "http://localhost:5173/success", // frontend
        ]);

        return response()->json($response->json());
    }

    // Step 2: Handle callback from Chapa
    public function callback(Request $request)
    {
        $tx_ref = $request->tx_ref;

        $verify = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('CHAPA_SECRET_KEY'),
        ])->get("https://api.chapa.co/v1/transaction/verify/{$tx_ref}");

        $data = $verify->json();

        if ($data['status'] === 'success' && $data['data']['status'] === 'success') {
            UserPayment::create([
                'name' => $data['data']['first_name'],
                'phone' => $data['data']['phone_number'],
                'amount' => $data['data']['amount'],
                'tx_ref' => $tx_ref,
                'status' => 'success',
            ]);
            return redirect("http://localhost:5173/success");
        }

        return redirect("http://localhost:5173/fail");
    }
}
