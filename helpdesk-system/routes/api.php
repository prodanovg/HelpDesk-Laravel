<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TicketPriorityController;
use App\Http\Controllers\TicketStatusController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {

    // Auth routes
    Route::get('/me', [AuthController::class, 'me']);

    // Ticket routes
    Route::apiResource('tickets', TicketController::class);
    Route::post('/tickets/{ticket}/assign', [TicketController::class, 'assign']);
    Route::patch('/tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
    Route::patch('/tickets/{ticket}/priority', [TicketController::class, 'updatePriority']);

    // User routes
    Route::apiResource('users', UserController::class)
        ->only(['index', 'show', 'update']);

    Route::patch('/users/{user}/profile', [UserController::class, 'updateProfile']);
    Route::patch('/users/{user}/password', [UserController::class, 'updatePassword']);

    // Statuses & Priorities
    Route::apiResource('ticket-statuses', TicketStatusController::class)
        ->only(['index', 'show']);

    Route::apiResource('ticket-priorities', TicketPriorityController::class)
        ->only(['index', 'show']);
});
