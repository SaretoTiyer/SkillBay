import { useState, useEffect, useCallback, useMemo } from 'react';
import { API_URL } from '../config/api';
import { showConfirm } from '../utils/swalHelpers';

export function useNotifications({ isAdmin = false, section = null } = {}) {
    const [notifications, setNotifications]   = useState([]);
    const [sectionCounts, setSectionCounts]   = useState({});
    const [loading, setLoading]               = useState(true);

    const getHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
    });

    const fetchSummary = useCallback(async () => {
        try {
            const token = localStorage.getItem("access_token");
            const params = new URLSearchParams();
            if (isAdmin) params.set("scope", "all");
            const response = await fetch(`${API_URL}/notificaciones/resumen?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            if (!response.ok) return;
            const data = await response.json();
            setSectionCounts(data?.sections || {});
        } catch (error) {
            console.error("Error notification summary:", error);
        }
    }, [isAdmin]);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");
            const params = new URLSearchParams();
            if (section && section !== "all") {
                params.set("seccion", section);
            }
            if (isAdmin) params.set("scope", "all");

            const response = await fetch(`${API_URL}/notificaciones?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            if (!response.ok) return;
            const data = await response.json();
            setNotifications(Array.isArray(data?.notificaciones) ? data.notificaciones : []);
        } catch (error) {
            console.error("Error notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [section, isAdmin]);

    const refetch = useCallback(() => {
        fetchSummary();
        fetchNotifications();
    }, [fetchSummary, fetchNotifications]);

    const markRead = useCallback(async (id) => {
        await fetch(`${API_URL}/notificaciones/${id}/leer`, { method: 'PATCH', headers: getHeaders() });
        refetch();
    }, [refetch]);

    const markAllRead = useCallback(async () => {
        if (section === 'all') {
            const result = await showConfirm('¿Marcar todas como leídas?', 'Esto afectará las notificaciones de TODAS las secciones.', 'Sí, marcar todas');
            if (!result.isConfirmed) return;
        }

        const params = new URLSearchParams();
        if (section && section !== "all") {
            params.set("seccion", section);
        }
        if (isAdmin) params.set("scope", "all");
        await fetch(`${API_URL}/notificaciones/marcar-todas-leidas?${params.toString()}`, {
            method: "PATCH",
            headers: getHeaders(),
        });
        refetch();
    }, [section, isAdmin, refetch]);

    const removeOne = useCallback(async (id) => {
        await fetch(`${API_URL}/notificaciones/${id}`, { method: 'DELETE', headers: getHeaders() });
        refetch();
    }, [refetch]);

    const clearAll = useCallback(async () => {
        if (section === 'all') {
            const result = await showConfirm('¿Eliminar todas las notificaciones?', 'Esta acción no se puede deshacer.', 'Sí, eliminar todas');
            if (!result.isConfirmed) return;
        }

        const params = new URLSearchParams();
        if (section && section !== "all") {
            params.set("seccion", section);
        }
        if (isAdmin) params.set("scope", "all");
        await fetch(`${API_URL}/notificaciones?${params.toString()}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        refetch();
    }, [section, isAdmin, refetch]);

    const unreadCount = useMemo(
        () => notifications.filter(n => n.estado !== 'Leido').length,
        [notifications]
    );

    useEffect(() => { refetch(); }, [section, isAdmin]);

    return { notifications, sectionCounts, loading, unreadCount,
             markRead, markAllRead, removeOne, clearAll, refetch };
}