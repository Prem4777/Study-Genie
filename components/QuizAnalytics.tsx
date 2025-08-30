import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from './ui/Card';
import type { QuizResult } from '../types';

interface QuizAnalyticsProps {
    quizResults: QuizResult[];
}

const COLORS = ['#5AAB61', '#FDCB46', '#E5555C', '#3D7DCA'];

const QuizAnalytics: React.FC<QuizAnalyticsProps> = ({ quizResults }) => {
    const totalQuizzes = quizResults.length;
    
    if (totalQuizzes === 0) {
        return (
            <Card>
               <Card.Header>
                   <Card.Title>Quiz Analytics</Card.Title>
               </Card.Header>
               <Card.Content className="text-center py-12">
                   <h3 className="text-xl font-medium">No quiz data yet!</h3>
                   <p className="text-gray-500 mt-2">Complete a quiz to see your progress here.</p>
               </Card.Content>
           </Card>
        )
    }

    const averageScore = quizResults.reduce((sum, r) => sum + (r.score / r.total), 0) / totalQuizzes;
    const bestScore = Math.max(...quizResults.map(r => r.score / r.total));
    
    const chartData = quizResults.map((r, i) => ({
        name: `Quiz ${i + 1}`,
        score: parseFloat(((r.score / r.total) * 100).toFixed(2)),
    }));
    
    const performanceData = [
        { name: 'Excellent (90-100%)', value: quizResults.filter(r => (r.score/r.total) >= 0.9).length },
        { name: 'Good (70-89%)', value: quizResults.filter(r => (r.score/r.total) >= 0.7 && (r.score/r.total) < 0.9).length },
        { name: 'Needs Improvement (<70%)', value: quizResults.filter(r => (r.score/r.total) < 0.7).length },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold">Quiz Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <Card.Header><Card.Title>Average Score</Card.Title></Card.Header>
                    <Card.Content><p className="text-4xl font-bold">{(averageScore * 100).toFixed(1)}%</p></Card.Content>
                </Card>
                <Card>
                    <Card.Header><Card.Title>Best Score</Card.Title></Card.Header>
                    <Card.Content><p className="text-4xl font-bold">{(bestScore * 100).toFixed(1)}%</p></Card.Content>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <Card.Header><Card.Title>Quiz Score History</Card.Title></Card.Header>
                    <Card.Content>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis unit="%" />
                                <Tooltip formatter={(value) => `${value}%`}/>
                                <Legend />
                                <Bar dataKey="score" fill="#3D7DCA" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card.Content>
                </Card>
                 <Card>
                    <Card.Header><Card.Title>Performance Breakdown</Card.Title></Card.Header>
                    <Card.Content>
                         <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={performanceData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {performanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} quizzes`, name]}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card.Content>
                </Card>
            </div>
        </div>
    );
};

export default QuizAnalytics;