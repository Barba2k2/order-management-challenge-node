import { describe, it, expect } from 'vitest';
import { OrderService } from '../src/services/order.service.js';
import { OrderState } from '../src/domain/enums/order.enum.js';

describe('Order State Transitions (Unit Tests)', () => {
  describe('getNextState', () => {
    it('should return ANALYSIS when current state is CREATED', () => {
      const nextState = OrderService.getNextState(OrderState.CREATED);
      expect(nextState).toBe(OrderState.ANALYSIS);
    });

    it('should return COMPLETED when current state is ANALYSIS', () => {
      const nextState = OrderService.getNextState(OrderState.ANALYSIS);
      expect(nextState).toBe(OrderState.COMPLETED);
    });

    it('should return null when current state is COMPLETED', () => {
      const nextState = OrderService.getNextState(OrderState.COMPLETED);
      expect(nextState).toBeNull();
    });
  });

  describe('canAdvance', () => {
    it('should return true for CREATED state', () => {
      expect(OrderService.canAdvance(OrderState.CREATED)).toBe(true);
    });

    it('should return true for ANALYSIS state', () => {
      expect(OrderService.canAdvance(OrderState.ANALYSIS)).toBe(true);
    });

    it('should return false for COMPLETED state', () => {
      expect(OrderService.canAdvance(OrderState.COMPLETED)).toBe(false);
    });
  });

  describe('state transition order', () => {
    it('should follow strict order: CREATED -> ANALYSIS -> COMPLETED', () => {
      let currentState = OrderState.CREATED;

      const firstTransition = OrderService.getNextState(currentState);
      expect(firstTransition).toBe(OrderState.ANALYSIS);
      currentState = firstTransition!;

      const secondTransition = OrderService.getNextState(currentState);
      expect(secondTransition).toBe(OrderState.COMPLETED);
      currentState = secondTransition!;

      const thirdTransition = OrderService.getNextState(currentState);
      expect(thirdTransition).toBeNull();
    });

    it('should not allow skipping states', () => {
      const states = [OrderState.CREATED, OrderState.ANALYSIS, OrderState.COMPLETED];

      for (let i = 0; i < states.length; i++) {
        const currentState = states[i];
        const nextState = OrderService.getNextState(currentState);

        if (nextState) {
          expect(nextState).toBe(states[i + 1]);
          expect(nextState).not.toBe(states[i + 2]);
        }
      }
    });

    it('should not allow going backwards', () => {
      expect(OrderService.getNextState(OrderState.COMPLETED)).not.toBe(OrderState.ANALYSIS);
      expect(OrderService.getNextState(OrderState.COMPLETED)).not.toBe(OrderState.CREATED);
      expect(OrderService.getNextState(OrderState.ANALYSIS)).not.toBe(OrderState.CREATED);
    });
  });
});
