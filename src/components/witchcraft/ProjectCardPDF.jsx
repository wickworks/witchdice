import React from 'react';
import { capitalize } from '../../utils.js';

import { Page, Text, View, Document, StyleSheet, Font, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import ReactMarkdown from 'react-markdown'
import fontBitter from "../../fonts/Bitter-VariableFont_wght.ttf"
import fontBitterItalic from "../../fonts/Bitter-Italic-VariableFont_wght.ttf"

const ProjectCardPDF = ({
  projectData,
}) => {

  return (
    <div className='ProjectCardPDF'>
      {/*<PDFDownloadLink document={<CardPDF projectData={projectData} />} fileName="project.pdf">
        {({ blob, url, loading, error }) => (loading ? 'Loading document...' : 'Export PDF')}
      </PDFDownloadLink>*/}

      <div className='ProjectCardPDF'>
        <PDFViewer>
          <CardPDF projectData={projectData} />
        </PDFViewer>
      </div>
    </div>
  )
}


// ============ PDF EXPORT ============ //
// Create styles

const parchment = '#f7f0e3'
const witchGreen = '#00a76d'
const styles = StyleSheet.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
    backgroundColor: parchment,
  },

  title: {
    fontFamily: 'Bitter',
    fontWeight: 'bold',
    fontSize: 44,
    color: witchGreen,
  },

  attributes: {
    fontFamily: 'Bitter',
    fontWeight: '800',
    fontSize: 18,
    margin: 6,
    color: witchGreen,
  },

  description: {
    fontFamily: 'Bitter',
    fontWeight: 'bold',
    marginTop: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: witchGreen,
  }
});

Font.register({ family: 'Bitter', fonts: [
  {
    family: 'Bitter',
    format: 'truetype',
    src: fontBitter,
    fontStyle: 'normal',
    fontWeight: 'normal'
  },{
    family: 'Bitter',
    format: 'truetype',
    src: fontBitter,
    fontStyle: 'normal',
    fontWeight: 'bold'
  },{
    family: 'Bitter',
    format: 'truetype',
    src: fontBitterItalic,
    fontStyle: 'italic',
    fontWeight: 'normal'
  }
]});

// Create Document Component
const CardPDF = ({projectData}) => (
  <Document title={projectData.name} creator={'witchdice.com'}>
    <Page size="A5" orientation="landscape" style={styles.page}>
      <View style={styles.title}>
        <Text>{projectData.name}</Text>
      </View>
      <View style={styles.attributes}>
        <Text>{`${capitalize(projectData.size)}, ${projectData.difficulty} project.`}</Text>
      </View>
      <View style={styles.description}>
        <Text> {projectData.desc} </Text>
      </View>
    </Page>
  </Document>
);


export default ProjectCardPDF ;
