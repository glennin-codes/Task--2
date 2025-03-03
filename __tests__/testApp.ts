import express from 'express';
import { redisClient } from './setup';
import { app as mainApp } from '../src/index';

// Use the main app instance
export const app = mainApp; 