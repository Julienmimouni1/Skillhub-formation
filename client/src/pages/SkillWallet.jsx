import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image as PdfImage, Font } from '@react-pdf/renderer';
import { Award, Download, Calendar, CheckCircle, Wallet } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Register fonts for PDF (optional, using standard fonts for now)
Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});

// PDF Styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        padding: 30,
        fontFamily: 'Helvetica'
    },
    header: {
        marginBottom: 20,
        borderBottom: 2,
        borderBottomColor: '#4f46e5',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e1b4b'
    },
    subtitle: {
        fontSize: 12,
        color: '#6b7280'
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        borderLeft: 4,
        borderLeftColor: '#4f46e5',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 5
    },
    cardMeta: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 3
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 10,
        borderTop: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 10
    }
});

// PDF Document Component
const SkillPassportPDF = ({ user, trainings }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Passeport de Compétences</Text>
                    <Text style={styles.subtitle}>SkillHub - {user.first_name} {user.last_name}</Text>
                </View>
                <View>
                    <Text style={{ fontSize: 10, color: '#4f46e5' }}>Généré le {new Date().toLocaleDateString()}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={{ fontSize: 14, marginBottom: 15, color: '#374151' }}>Formations Validées & Acquises</Text>
                {trainings.map((training, index) => (
                    <View key={index} style={styles.card}>
                        <Text style={styles.cardTitle}>{training.title}</Text>
                        <Text style={styles.cardMeta}>Date de complétion : {new Date(training.updatedAt).toLocaleDateString()}</Text>
                        <Text style={styles.cardMeta}>Type : {training.type}</Text>
                        <Text style={{ fontSize: 10, color: '#059669', marginTop: 5 }}>
                            ✓ Compétences validées
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.footer}>
                <Text>Ce document atteste des formations suivies et validées sur la plateforme SkillHub.</Text>
                <Text>SkillHub © {new Date().getFullYear()}</Text>
            </View>
        </Page>
    </Document>
);

export default function SkillWallet() {
    const { user } = useAuth();
    const [trainings, setTrainings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompletedTrainings();
    }, []);

    const fetchCompletedTrainings = async () => {
        try {
            // Fetch requests that are COMPLETED or APPROVED (assuming approved & past date = completed for now, or just COMPLETED)
            // Ideally backend should filter this, but we'll filter client side for now based on existing endpoints
            const response = await axios.get('/requests');
            const allRequests = response.data.requests;

            // Filter for completed trainings
            const completed = allRequests.filter(req =>
                req.status === 'COMPLETED' ||
                (req.status === 'APPROVED' && new Date(req.date) < new Date())
            );

            setTrainings(completed);
        } catch (error) {
            console.error("Error fetching trainings:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement de votre portefeuille...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Wallet className="h-8 w-8 text-navy-600" />
                        Skill Wallet
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Votre passeport de compétences numérique. Retrouvez ici toutes vos formations validées.
                    </p>
                </div>

                {trainings.length > 0 && (
                    <PDFDownloadLink
                        document={<SkillPassportPDF user={user} trainings={trainings} />}
                        fileName={`SkillHub_Passeport_${user.first_name}_${user.last_name}.pdf`}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                        {({ blob, url, loading, error }) =>
                            loading ? 'Génération du PDF...' : (
                                <>
                                    <Download className="h-5 w-5 mr-2" />
                                    Télécharger mon Passeport
                                </>
                            )
                        }
                    </PDFDownloadLink>
                )}
            </div>

            {trainings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
                    <Award className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune formation validée</h3>
                    <p className="mt-1 text-sm text-gray-500">Complétez des formations pour remplir votre Skill Wallet !</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trainings.map((training) => (
                        <div key={training.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="h-2 bg-gradient-to-r from-navy-500 to-navy-600"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-navy-50 rounded-xl group-hover:bg-navy-100 transition-colors">
                                        <Award className="h-6 w-6 text-navy-600" />
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Validé
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 h-14">
                                    {training.title}
                                </h3>
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {new Date(training.updatedAt).toLocaleDateString()}
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>SkillHub Certified</span>
                                        <span className="font-mono text-navy-600">ID: {String(training.id).substring(0, 8)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
