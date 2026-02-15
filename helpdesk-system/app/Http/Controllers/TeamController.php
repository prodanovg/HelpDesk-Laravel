<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Http\Requests\Team\StoreTeamRequest;
use App\Http\Requests\Team\UpdateTeamRequest;
use App\Http\Resources\TeamResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TeamController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of teams
     */
    public function index()
    {
        $teams = Team::where('is_active', true)->get();

        return TeamResource::collection($teams);
    }

    /**
     * Store a newly created team
     */
    public function store(StoreTeamRequest $request)
    {
        $this->authorize('create', Team::class);

        $team = Team::create($request->validated());

        return new TeamResource($team);
    }

    /**
     * Display the specified team
     */
    public function show(Team $team)
    {
        $this->authorize('view', $team);

        $team->load('tickets');

        return new TeamResource($team);
    }

    /**
     * Update the specified team
     */
    public function update(UpdateTeamRequest $request, Team $team)
    {
        $this->authorize('update', $team);

        $team->update($request->validated());

        return new TeamResource($team);
    }

    /**
     * Remove the specified team
     */
    public function destroy(Team $team)
    {
        $this->authorize('delete', $team);

        if ($team->tickets()->count() > 0) {
            return response()->json([
                'error' => 'Cannot delete team with existing tickets'
            ], 422);
        }

        $team->delete();

        return response()->json([
            'message' => 'Team deleted successfully'
        ]);
    }
}
