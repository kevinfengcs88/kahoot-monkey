import sys
import urllib.request as ur
import json

gameid = str(sys.argv[1])
url = "https://play.kahoot.it/rest/kahoots/" + gameid
q = json.loads(ur.urlopen(url).read())["questions"]
colours = ["red", "blue", "yellow", "green"]
answers = []

for index, slide in enumerate(q):
    if slide.get("type") == "quiz":
        for i in range(len(slide.get("choices"))):
            if slide["choices"][i]["correct"]:
                colours_list = colours[:2][::-1] if len(slide.get("choices")) == 2 else colours
                answers.append(colours_list[i])

print(answers)