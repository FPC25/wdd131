let aCourse = {
  code: "WDD131",
  title: "Dynamic Web Fundamentals",
  credits: 2,
  sections: [
    {
      section: "01",
      enrolled: 95,
      instructor: "John Doe",
    },
    {
      section: "02",
      enrolled: 80,
      instructor: "Jane Smith",
    },
    {
        section: "03",
        enrolled: 75,
        instructor: "Emily Johnson",
    }
  ],
};

function setCourseInformation(course) {
  document.querySelector(
    "#courseName"
  ).innerHTML = `${course.code} — ${course.title}`;
}

function sectionTemplate(section) {
  return `<tr>
            <td>${section.section}</td>
            <td>${section.enrolled}</td>
            <td>${section.instructor}</td>
          </tr>`;
}

function renderSections(sections) {
    const html = sections.map(sectionTemplate);
    document.querySelector("#sections tbody").innerHTML = html.join("");
}

setCourseInformation(aCourse);
renderSections(aCourse.sections);
