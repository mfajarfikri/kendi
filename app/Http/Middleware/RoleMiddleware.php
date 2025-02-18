<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user() || !in_array($request->user()->role, $roles)) {
            return redirect()->route('dashboard.index')->with('error', 'Anda tidak memiliki akses ke halaman ini.');
        }

        return $next($request);
    }
} 