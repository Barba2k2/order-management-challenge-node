import { describe, it, expect } from 'vitest';
import { orderService } from '../src/services/order.service.js';
import { OrderState } from '../src/models/order.model.js';

describe('Order State Transitions (Unit Tests)', () => {
  describe('getNextState', () => {
    it('should return ANALYSIS when current state is CREATED', () => {
      const nextState = orderService.getNextState(OrderState.CREATED);
      expect(nextState).toBe(OrderState.ANALYSIS);
    });

    it('should return COMPLETED when current state is ANALYSIS', () => {
      const nextState = orderService.getNextState(OrderState.ANALYSIS);
      expect(nextState).toBe(OrderState.COMPLETED);
    });

    it('should return null when current state is COMPLETED', () => {
      const nextState = orderService.getNextState(OrderState.COMPLETED);
      expect(nextState).toBeNull();
    });
  });

  describe('canAdvance', () => {
    it('should return true for CREATED state', () => {
      expect(orderService.canAdvance(OrderState.CREATED)).toBe(true);
    });

    it('should return true for ANALYSIS state', () => {
      expect(orderService.canAdvance(OrderState.ANALYSIS)).toBe(true);
    });

    it('should return false for COMPLETED state', () => {
      expect(orderService.canAdvance(OrderState.COMPLETED)).toBe(false);
    });
  });

  describe('state transition order', () => {
    it('should follow strict order: CREATED -> ANALYSIS -> COMPLETED', () => {
      let currentState = OrderState.CREATED;

      const firstTransition = orderService.getNextState(currentState);
      expect(firstTransition).toBe(OrderState.ANALYSIS);
      currentState = firstTransition!;

      const secondTransition = orderService.getNextState(currentState);
      expect(secondTransition).toBe(OrderState.COMPLETED);
      currentState = secondTransition!;

      const thirdTransition = orderService.getNextState(currentState);
      expect(thirdTransition).toBeNull();
    });

    it('should not allow skipping states', () => {
      const states = [OrderState.CREATED, OrderState.ANALYSIS, OrderState.COMPLETED];

      for (let i = 0; i < states.length; i++) {
        const currentState = states[i];
        const nextState = orderService.getNextState(currentState);

        if (nextState) {
          expect(nextState).toBe(states[i + 1]);
          expect(nextState).not.toBe(states[i + 2]);
        }
      }
    });

    it('should not allow going backwards', () => {
      expect(orderService.getNextState(OrderState.COMPLETED)).not.toBe(OrderState.ANALYSIS);
      expect(orderService.getNextState(OrderState.COMPLETED)).not.toBe(OrderState.CREATED);
      expect(orderService.getNextState(OrderState.ANALYSIS)).not.toBe(OrderState.CREATED);
    });
  });
});
