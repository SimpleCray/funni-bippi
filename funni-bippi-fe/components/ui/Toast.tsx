'use client';

interface ToastProps {
  icon: string;
  text: string;
}

export function Toast({ icon, text }: ToastProps) {
  return (
    <div className='toast-wrap'>
      <div className='toast'>
        <span className='spark'>{icon}</span>
        {text}
      </div>
    </div>
  );
}
