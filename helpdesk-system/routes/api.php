<?php

use App\Http\Controllers\AIController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TicketPriorityController;
use App\Http\Controllers\TicketStatusController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {

    // Auth routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Ticket routes
    Route::apiResource('tickets', TicketController::class);
    Route::post('/tickets/{ticket}/assign', [TicketController::class, 'assign']);
    Route::patch('/tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
    Route::patch('/tickets/{ticket}/priority', [TicketController::class, 'updatePriority']);

    // Team routes
    Route::get('/teams', [TeamController::class, 'index']);
    Route::post('/teams', [TeamController::class, 'store']);
    Route::get('/teams/{team}', [TeamController::class, 'show']);
    Route::put('/teams/{team}', [TeamController::class, 'update']);
    Route::delete('/teams/{team}', [TeamController::class, 'destroy']);

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

    //Ai controller
    Route::post('/ai/suggest-ticket-classification', [AIController::class, 'suggestTicketClassification']);

});
