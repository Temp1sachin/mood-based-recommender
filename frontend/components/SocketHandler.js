'use client';

import { useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import socket from '../lib/socket'; // Adjust the path as necessary
import { toast } from 'sonner'; // ✅ FIX: Changed to use 'sonner' to match your layout
import { UserContext } from '../context/UserContext';

const SocketHandler = () => {
  const router = useRouter();
  const { user } = useContext(UserContext);

  // This effect registers the user's email with their socket ID on the server
  useEffect(() => {
    if (user?.email) {
      console.log(`Registering user: ${user.email}`);
      socket.emit('register-user', user.email);
    }

    // Also handle re-connection events
    const handleConnect = () => {
      if (user?.email) {
        console.log(`Re-registering user after reconnect: ${user.email}`);
        socket.emit('register-user', user.email);
      }
    };

    socket.on('connect', handleConnect);

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [user]);


  // This effect sets up the listeners for receiving invites and responses
  useEffect(() => {
    const handleReceiveInvite = ({ fromEmail, roomId }) => {
      // ✅ FIX: Using sonner's toast API for a consistent UI
      toast.info(`🎬 ${fromEmail} invited you to a Blend Room!`, {
        duration: 10000, // Keep the notification on screen longer
        action: {
          label: "Accept",
          onClick: () => {
            // Logic to accept the invite
            socket.emit('respond-invite', {
              toEmail: user.email,
              fromEmail,
              roomId,
              accepted: true,
            });
            router.push(`/blend/${roomId}`);
          },
        },
        // You can add a cancel button if you wish, but the default 'x' works too
      });
    };

    const handleInviteResponse = ({ toEmail, accepted }) => {
      if (accepted) {
        toast.success(`${toEmail} accepted your Blend invite!`);
      } else {
        toast.error(`${toEmail} declined your Blend invite.`);
      }
    };

    socket.on('receive-invite', handleReceiveInvite);
    socket.on('invite-response', handleInviteResponse);

    return () => {
      socket.off('receive-invite');
      socket.off('invite-response');
    };
  }, [user, router]); // Dependencies are correct

  return null; // This component does not render any UI
};

export default SocketHandler;