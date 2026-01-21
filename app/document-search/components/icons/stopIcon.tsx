import React from 'react';

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
};

export default function StopIcon({
  width = 24,
  height = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="20" fill="url(#paint0_linear_646_9311)"/>
      <path d="M25.8047 12.625C26.9093 12.625 27.8047 13.5204 27.8047 14.625V25.375L27.7949 25.5791C27.6927 26.5878 26.8404 27.375 25.8047 27.375H14.1875C13.1518 27.375 12.3005 26.5878 12.1982 25.5791L12.1875 25.375V14.625C12.1875 13.5893 12.9747 12.738 13.9834 12.6357L14.1875 12.625H25.8047ZM14.1875 25.375H25.8047V14.625H14.1875V25.375ZM23.3359 15.6621C23.8882 15.6621 24.3359 16.1098 24.3359 16.6621V23.3389C24.3357 23.8909 23.8881 24.3388 23.3359 24.3389H16.6592C16.1071 24.3387 15.6594 23.8909 15.6592 23.3389V16.6621C15.6592 16.1099 16.107 15.6622 16.6592 15.6621H23.3359Z" fill="white"/>
      <defs>
    <linearGradient id="paint0_linear_646_9311" x1="-18.5417" y1="-9.5" x2="50.0451" y2="2.74763" gradientUnits="userSpaceOnUse">
      <stop stopColor="#6A3398"/>
      <stop offset="1" stopColor="#3C77EF"/>
    </linearGradient>
    </defs>
    </svg>
  );
}