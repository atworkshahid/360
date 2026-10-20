import React, { createContext, useContext } from 'react';

export const StudentViewContext = createContext<{ isStudentView: boolean }>({ isStudentView: false });

export const useStudentView = () => useContext(StudentViewContext);
