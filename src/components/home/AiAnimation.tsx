
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Node {
  x: number;
  y: number;
  size: number;
  connections: number[];
  color: string;
  className?: string;
}

export function AiAnimation() {
  const [nodes, setNodes] = useState<Node[]>([]);
  
  useEffect(() => {
    // Generate random nodes for the animation
    const generateNodes = () => {
      const newNodes: Node[] = [];
      const colors = ["#2D3748", "#805AD5", "#4299E1"];
      const classNames = ["float", "float-slow", "float-fast"];
      
      // Create input layer
      for (let i = 0; i < 4; i++) {
        newNodes.push({
          x: 20,
          y: 15 + i * 22,
          size: 6 + Math.random() * 4,
          connections: [4, 5, 6, 7],
          color: colors[0],
          className: classNames[i % 3]
        });
      }
      
      // Create hidden layer
      for (let i = 0; i < 4; i++) {
        newNodes.push({
          x: 50,
          y: 15 + i * 22,
          size: 6 + Math.random() * 4,
          connections: [8, 9],
          color: colors[1],
          className: classNames[(i + 1) % 3]
        });
      }
      
      // Create output layer
      for (let i = 0; i < 2; i++) {
        newNodes.push({
          x: 80,
          y: 25 + i * 40,
          size: 8 + Math.random() * 4,
          connections: [],
          color: colors[2],
          className: classNames[(i + 2) % 3]
        });
      }
      
      setNodes(newNodes);
    };
    
    generateNodes();
  }, []);
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      className="w-full max-w-md h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Connection lines */}
      {nodes.map((node, nodeIndex) => 
        node.connections.map((targetIndex, connIndex) => (
          <line 
            key={`${nodeIndex}-${connIndex}`}
            x1={`${node.x}%`} 
            y1={`${node.y}%`} 
            x2={`${nodes[targetIndex]?.x}%`} 
            y2={`${nodes[targetIndex]?.y}%`}
            stroke="rgba(156, 163, 175, 0.5)"
            strokeWidth="0.5"
          />
        ))
      )}
      
      {/* Nodes */}
      {nodes.map((node, index) => (
        <circle 
          key={index}
          cx={`${node.x}%`} 
          cy={`${node.y}%`} 
          r={node.size} 
          fill={node.color}
          opacity="0.8"
          className={cn("transition-all duration-300", node.className)}
        />
      ))}
    </svg>
  );
}
