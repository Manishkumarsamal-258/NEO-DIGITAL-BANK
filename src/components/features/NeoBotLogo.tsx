/**
 * ── NeoBot Animated Robot Logo ────────────────────────────
 * An animated robot head SVG with glowing eyes, rotating
 * antenna, pulsing circuits, and a friendly banking-themed
 * design. Built with pure CSS animations + SVG.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeoBotLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
  variant?: 'default' | 'chat' | 'minimal';
}

export default function NeoBotLogo({
  size = 48,
  className,
  animated = true,
  variant = 'default',
}: NeoBotLogoProps) {
  const isChat = variant === 'chat';
  const isMinimal = variant === 'minimal';

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      {/* Glow effect ring */}
      {animated && !isMinimal && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
            filter: 'blur(2px)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Core robot SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* ── Antenna ── */}
        <motion.g
          animate={
            animated
              ? {
                  rotate: [-3, 3, -3],
                }
              : {}
          }
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '50px 60px' }}
        >
          <motion.line
            x1="50"
            y1="5"
            x2="50"
            y2="22"
            stroke="url(#antennaGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={
              animated
                ? {
                    opacity: [0.6, 1, 0.6],
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Antenna ball */}
          <motion.circle
            cx="50"
            cy="5"
            r="4"
            fill="#10B981"
            animate={
              animated
                ? {
                    r: [4, 5.5, 4],
                    fill: ['#10B981', '#34D399', '#10B981'],
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Antenna glow */}
          {animated && (
            <motion.circle
              cx="50"
              cy="5"
              r="8"
              fill="#10B981"
              opacity={0.15}
              animate={{
                r: [8, 12, 8],
                opacity: [0.15, 0.3, 0.15],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.g>

        {/* ── Robot Head (main body) ── */}
        <motion.rect
          x="18"
          y="22"
          width="64"
          height="56"
          rx="12"
          fill="url(#headGrad)"
          stroke="url(#borderGrad)"
          strokeWidth="1.5"
          animate={
            animated
              ? {
                  y: [22, 21, 22],
                }
              : {}
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Circuit lines on head */}
        {animated && !isMinimal && (
          <g opacity="0.3">
            <motion.path
              d="M25 35 L35 35 L40 30"
              stroke="#34D399"
              strokeWidth="1"
              fill="none"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            />
            <motion.path
              d="M75 45 L65 45 L60 50"
              stroke="#34D399"
              strokeWidth="1"
              fill="none"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.circle
              cx="65"
              cy="45"
              r="1.5"
              fill="#34D399"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
            />
          </g>
        )}

        {/* ── Eyes ── */}
        {/* Left eye */}
        <motion.ellipse
          cx="38"
          cy="40"
          rx="7"
          ry="8"
          fill="#0F172A"
          animate={
            animated
              ? {
                  rx: [7, 7.5, 7],
                  ry: [8, 8.5, 8],
                }
              : {}
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.ellipse
          cx="38"
          cy="40"
          rx="4"
          ry="5"
          fill="url(#eyeGradLeft)"
          animate={
            animated
              ? {
                  opacity: [0.8, 1, 0.8],
                  rx: [4, 5, 4],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Eye shine */}
        <motion.circle
          cx="36"
          cy="38"
          r="1.5"
          fill="white"
          opacity={0.8}
          animate={
            animated
              ? {
                  opacity: [0.5, 1, 0.5],
                }
              : {}
          }
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          }}
        />

        {/* Right eye */}
        <motion.ellipse
          cx="62"
          cy="40"
          rx="7"
          ry="8"
          fill="#0F172A"
          animate={
            animated
              ? {
                  rx: [7, 7.5, 7],
                  ry: [8, 8.5, 8],
                }
              : {}
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.ellipse
          cx="62"
          cy="40"
          rx="4"
          ry="5"
          fill="url(#eyeGradRight)"
          animate={
            animated
              ? {
                  opacity: [0.8, 1, 0.8],
                  rx: [4, 5, 4],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
        />
        {/* Eye shine */}
        <motion.circle
          cx="60"
          cy="38"
          r="1.5"
          fill="white"
          opacity={0.8}
          animate={
            animated
              ? {
                  opacity: [0.5, 1, 0.5],
                }
              : {}
          }
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />

        {/* ── Mouth / Speaker grills ── */}
        <g>
          <motion.rect
            x="35"
            y="56"
            width="30"
            height="4"
            rx="2"
            fill="url(#mouthGrad)"
            animate={
              animated
                ? {
                    opacity: [0.6, 1, 0.6],
                  }
                : {}
            }
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Speaker lines */}
          {[0, 8, 16].map((offset, i) => (
            <motion.rect
              key={i}
              x={38 + offset}
              y="62"
              width="4"
              height="2"
              rx="1"
              fill="#6B7280"
              animate={
                animated
                  ? {
                      opacity: [0.3, 0.7, 0.3],
                    }
                  : {}
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}
        </g>

        {/* ── Ears / Side panels ── */}
        <motion.rect
          x="12"
          y="34"
          width="8"
          height="20"
          rx="3"
          fill="url(#earGrad)"
          stroke="url(#borderGrad)"
          strokeWidth="1"
          animate={
            animated
              ? {
                  opacity: [0.7, 1, 0.7],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
        <motion.rect
          x="80"
          y="34"
          width="8"
          height="20"
          rx="3"
          fill="url(#earGrad)"
          stroke="url(#borderGrad)"
          strokeWidth="1"
          animate={
            animated
              ? {
                  opacity: [0.7, 1, 0.7],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.8,
          }}
        />

        {/* ── Banking $ymbol on forehead ── */}
        {!isMinimal && (
          <motion.text
            x="50"
            y="32"
            textAnchor="middle"
            fill="rgba(16,185,129,0.6)"
            fontSize="9"
            fontWeight="bold"
            fontFamily="system-ui"
            animate={
              animated
                ? {
                    opacity: [0.3, 0.7, 0.3],
                  }
                : {}
            }
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            ₿
          </motion.text>
        )}

        {/* ── Gradients ── */}
        <defs>
          <linearGradient id="headGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="50%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="borderGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="eyeGradLeft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id="eyeGradRight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id="mouthGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="earGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="antennaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>

      {/* Pulse dots - orbiting around the robot */}
      {animated && !isMinimal && (
        <>
          {[0, 90, 180, 270].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: '#10B981',
                opacity: 0,
              }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1.2, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </>
      )}

      {/* Chat variant: small sound wave bars */}
      {isChat && animated && (
        <div className="absolute -bottom-1 flex items-end gap-[2px]">
          {[4, 3, 5, 3, 4].map((h, i) => (
            <motion.div
              key={i}
              className="w-[2px] bg-emerald-400 rounded-full"
              style={{ height: h }}
              animate={{
                height: [h, h + 4, h],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.12,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
