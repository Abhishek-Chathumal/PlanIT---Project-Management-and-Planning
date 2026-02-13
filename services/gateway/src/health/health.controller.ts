// ============================================
// PlanIT.IO — Health Check Controller
// ============================================
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    @Get()
    @ApiOperation({ summary: 'Health check' })
    @ApiResponse({ status: 200, description: 'Service is healthy' })
    check() {
        return {
            status: 'ok',
            service: 'planit-gateway',
            version: '0.1.0',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }

    @Get('ready')
    @ApiOperation({ summary: 'Readiness check' })
    @ApiResponse({ status: 200, description: 'Service is ready to accept requests' })
    ready() {
        return {
            status: 'ready',
            checks: {
                memory: this.checkMemory(),
            },
        };
    }

    private checkMemory() {
        const used = process.memoryUsage();
        return {
            heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
            rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
        };
    }
}
