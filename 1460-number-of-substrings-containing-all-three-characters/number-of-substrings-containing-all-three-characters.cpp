class Solution {
public:
    int numberOfSubstrings(string s) {
        int n = s.size();
        vector<int> count(3, -1);
        int ans = 0;
        for (int i=0;i<n;i++){
            count[s[i]-'a']=i;
            if (count[0]!=-1 && count[1]!=-1 && count[2]!=-1){
                int minmum=min({count[0],count[1],count[2]});
                ans = ans+minmum+1;
            }
        }
        return ans;
    }
};