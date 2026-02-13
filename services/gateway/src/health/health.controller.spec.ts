import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
    let controller: HealthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
        }).compile();

        controller = module.get<HealthController>(HealthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('check', () => {
        it('should return healthy status', () => {
            const result = controller.check();
            expect(result.status).toBe('ok');
            expect(result.service).toBe('planit-gateway');
            expect(result.version).toBe('0.1.0');
            expect(result.timestamp).toBeDefined();
        });
    });

    describe('ready', () => {
        it('should return ready status with memory info', () => {
            const result = controller.ready();
            expect(result.status).toBe('ready');
            expect(result.checks.memory).toBeDefined();
            expect(result.checks.memory.heapUsed).toBeDefined();
        });
    });
});
