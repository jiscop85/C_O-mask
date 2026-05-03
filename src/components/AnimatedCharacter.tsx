import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface AnimatedCharacterProps {
  emailFocused: boolean;
  passwordFocused: boolean;
  passwordVisible: boolean;
}

